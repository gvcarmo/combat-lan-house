import 'dotenv/config'
import express from 'express';
import pg from 'pg'
import { PrismaClient } from '@prisma/client/index.js'
import { PrismaPg } from '@prisma/adapter-pg'
import routes from './routes/userRoutes.js';
import cors from 'cors';
import axios from 'axios';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter });
const httpServer = createServer(app);

app.use(cors({
    origin: '*',
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const io = new Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        methods: ["GET", "POST", "PATCH", "DELETE"],
        credentials: true
    },
    allowEIO3: true
});

app.set('io', io);

// --- 1. ROTA DE HISTÓRICO (Para o F5 do Cliente) ---
app.get('/chat/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const chat = await prisma.message.findUnique({
            where: { id: Number(id) }
        });

        if (!chat) return res.status(404).json({ error: "Não encontrado" });

        res.json(chat);
    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar chat" });
    }
});

// --- 2. ROTA DE ENCERRAMENTO (Admin clica em Fechar) ---
app.patch('/admin/chat/:id/encerrar', async (req, res) => {
    const { id } = req.params;

    try {
        const chatFinalizado = await prisma.message.update({
            where: { id: Number(id) },
            data: { status: 'finalizado' } // Ou 'fechado', conforme seu schema
        });

        // Avisa o socket para o cliente limpar o localStorage
        io.emit('chat_encerrado', { chatId: Number(id) });

        res.json(chatFinalizado);
    } catch (error) {
        res.status(500).json({ error: "Erro ao encerrar chat" });
    }
});

// --- 3. LOGICA DO SOCKET (Mensagens em Tempo Real) ---
const adminsOnline = new Map();

io.on('connection', (socket) => {
    console.log('Alguém conectou:', socket.id);

    // O 'socket' só existe aqui dentro!
    socket.on('enviar_mensagem', async (data) => {
        const { chatId, mensagem, autor, nome_completo } = data;

        try {
            // 1. No Prisma, usamos o update diretamente
            // Buscamos o chat atual para pegar o array de mensagens existente
            const chatAtual = await prisma.message.findUnique({
                where: { id: Number(chatId) }
            });

            if (!chatAtual) return;

            // 2. Criamos a nova mensagem
            const novaMsg = {
                autor,
                nome_completo: nome_completo || (autor === 'admin' ? 'Atendente' : 'Cliente'),
                mensagem,
                criadoEm: new Date().toISOString()
            };

            // 3. Atualizamos o array (o Prisma entende que 'mensagem' é um campo Json)
            // Fazemos o "merge" do que já existia com a nova
            const mensagensAntigas = Array.isArray(chatAtual.mensagem) ? chatAtual.mensagem : [];
            const mensagensAtualizadas = [...mensagensAntigas, novaMsg];

            const chatAtualizado = await prisma.message.update({
                where: { id: Number(chatId) },
                data: {
                    mensagem: mensagensAtualizadas
                }
            });

            // 4. Avisa todo mundo (Admin e Cliente)
            io.emit('nova_mensagem_chat', chatAtualizado);

        } catch (err) {
            console.error("Erro ao salvar no Prisma:", err);
        }
    });

    socket.on('disconnect', () => {
        console.log('Usuário saiu');
    });

    socket.on('encerrar_chat_admin', async (data) => {
        const { chatId } = data;

        try {
            // 1. Busca o chat para adicionar a mensagem final no histórico
            const chatAtual = await prisma.message.findUnique({
                where: { id: Number(chatId) }
            });

            if (!chatAtual) return;

            // 2. Prepara a mensagem de encerramento
            const mensagensAntigas = Array.isArray(chatAtual.mensagem) ? chatAtual.mensagem : [];

            const historicoEncerrado = [
                ...mensagensAntigas,
                {
                    autor: 'admin',
                    nome: 'SISTEMA',
                    mensagem: '🛑 Este atendimento foi encerrado pelo administrador.',
                    criadoEm: new Date().toISOString()
                }
            ];

            const chatAtualizado = await prisma.message.update({
                where: { id: Number(chatId) },
                data: {
                    status: 'fechado',
                    mensagem: historicoEncerrado,
                    atualizadoEm: new Date()
                }
            });

            // 4. Avisa TODO MUNDO (Admin limpa a tela, Cliente limpa o storage)
            io.emit('nova_mensagem_chat', chatAtualizado);
            io.emit('chat_encerrado', { chatId: Number(chatId) }); // Gatilho de limpeza

            console.log(`✅ Chat ${chatId} encerrado via Socket`);
        } catch (err) {
            console.error("Erro ao encerrar chat via Socket:", err);
        }
    });

    // 3. Novo evento: Quando o cliente entra, ele pergunta "tem admin?"
    socket.on('admin_entrou', (adminId) => {
        console.log("🔥 RECEBI UM ADMIN NO SERVER! ID:", adminId);
        adminsOnline.set(socket.id, adminId);
        io.emit('status_admin', { online: true });
    });

    socket.on('verificar_admin_online', () => {
        socket.emit('status_admin', { online: adminsOnline.size > 0 });
    });

    socket.on('disconnect', () => {
        if (adminsOnline.has(socket.id)) {
            adminsOnline.delete(socket.id);
            io.emit('status_admin', { online: adminsOnline.size > 0 });
        }
    });

    socket.on('typing', (data) => {
        // Fazemos o socket entrar na sala do chat para garantir que o sinal chegue
        socket.join(`chat_${data.chatId}`);

        // Envia para todos na sala, exceto quem enviou (broadcast)
        socket.to(`chat_${data.chatId}`).emit('user_typing', {
            nome: data.nome,
            isTyping: data.isTyping
        });
    });
});

app.use(express.json());

app.use((req: any, res, next) => {
    req.io = io;
    return next();
});

app.use(express.urlencoded({ extended: true }))
app.use(routes)
app.use('/uploads', express.static('uploads'));

httpServer.listen(3000, () => console.log("Servidor rodando com socket.io na porta 3000"));

const APP_URL = process.env.APP_URL

setInterval(async () => {
    if (APP_URL) {
        try {
            await axios.get(APP_URL);
            console.log('Ping efetuado para manter o servidor ativo!');
        } catch (error) {
            console.error('Erro no auto-ping:', error);
        }
    }
}, 840000)




export default prisma