import { Request, Response } from 'express';
import prisma from "../server.js";

export class MessageController {
    async sendMessage(req: any, res: Response) {
        try {
            const userId = req.user?.id;
            let { assunto, mensagem, status } = req.body;

            if (!userId) {
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }

            const arquivosUpload = req.files ? (req.files as any[]).map(file => ({
                name: file.originalname,
                url: file.path,
                size: file.size
            })) : [];

            const mensagemJSON = typeof mensagem === 'string' ? JSON.parse(mensagem) : mensagem;

            const novaMensagem = await prisma.message.create({
                data: {
                    usuarioId: Number(userId),
                    assunto,
                    mensagem: mensagemJSON,
                    status: 'em espera',
                    enviarArquivo: arquivosUpload
                }
            });
            return res.status(201).json(novaMensagem);
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            return res.status(500).json({ error: 'Erro ao enviar mensagem' });
        }
    }

    async listMyMessages(req: any, res: Response) {
        const { userId } = req.user.id;
        try {
            const messages = await prisma.message.findMany({
                where: {
                    usuarioId: userId
                },
                orderBy: {
                    criadoEm: 'desc'
                }
            });
            return res.json(messages);
        } catch (error) {
            console.error('Erro ao listar mensagens:', error);
            return res.status(500).json({ error: 'Erro ao listar mensagens' });
        }
    }

    async getMessageById(req: any, res: Response) {
        const { id } = req.params;
        const userId = req.user.id;

        try {
            const message = await prisma.message.findUnique({
                where: {
                    id: Number(id),
                    usuarioId: userId
                }
            });
            return res.json(message);
        } catch (error) {
            console.error('Erro ao buscar mensagem:', error);
            return res.status(500).json({ error: 'Erro ao buscar mensagem' });
        }
    }

    async replyMessage(req: Request, res: Response) {
        const { id } = req.params;

        try {
            const body = req.body || {};
            const textoMensagem = body.mensagem
            const nivelUsuario = (req.user as any)?.nivel;

            if (!textoMensagem) {
                return res.status(400).json({ error: 'Escreva uma mensagem.' });
            }

            const messageRecord = await prisma.message.findUnique({ where: { id: Number(id) } });

            if (!messageRecord) {
                return res.status(404).json({ error: 'Conversa não encontrada' });
            }

            const novaResposta = {
                autor: nivelUsuario === 'admin' ? 'admin' : 'user',
                mensagem: typeof textoMensagem === 'object' ? textoMensagem.mensagem : textoMensagem,
                criadoEm: new Date()
            }

            const historico = Array.isArray(messageRecord.mensagem)
                ? [...messageRecord.mensagem, novaResposta]
                : [{ autor: 'user', mensagem: messageRecord.mensagem, criadoEm: messageRecord.criadoEm }, novaResposta]

            const atualizada = await prisma.message.update({
                where: { id: Number(id) },
                data: {
                    mensagem: historico,
                    status: nivelUsuario === 'admin' ? 'respondida' : 'em espera',
                    atualizadoEm: new Date()
                }
            });
            return res.json(atualizada);
        } catch (error) {
            console.error('Erro ao responder mensagem:', error);
            return res.status(500).json({ error: 'Erro ao responder mensagem' });
        }
    }

    async deleteMessage(req: any, res: Response) {
        const { id } = req.params;
        const userId = req.user.id;

        if (!id) {
            return res.status(400).json({ error: 'Mensagem não encontrada.' });
        }

        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado.' });
        }

        try {
            await prisma.message.delete({
                where: {
                    id: Number(id),
                    usuarioId: userId
                }
            });
            return res.json({ message: 'Mensagem deletada com sucesso' });
        } catch (error) {
            console.error('Erro ao deletar mensagem:', error);
            return res.status(500).json({ error: 'Erro ao deletar mensagem' });
        }
    }

    async closeMessage(req: Request, res: Response) {
        const { id } = req.params;
        const nivelUsuario = (req.user as any)?.nivel;

        if (nivelUsuario !== 'admin') {
            return res.status(403).json({ error: "Apenas administradores podem fechar tickets." })
        }

        try {
            const atualizada = await prisma.message.update({
                where: { id: Number(id) },
                data: {
                    status: 'fechado',
                    atualizadoEm: new Date()
                }
            });
            return res.json(atualizada);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao fechar o ticket.' })
        }
    }

    async historico(req: Request, res: Response) {
        const nivelUsuario = (req.user as any)?.nivel;

        if (nivelUsuario !== 'admin') {
            return res.status(403).json({ error: "Acesso negado." });
        }
        try {
            const mensagensFechadas = await prisma.message.findMany({
                where: {
                    status: 'fechado'
                },
                orderBy: {
                    atualizadoEm: 'desc'
                }
            });
            return res.json(mensagensFechadas);
        } catch (error) {
            console.error("Erro ao buscar histórico:", error);
            return res.status(500).json({ error: "Erro ao carregar histórico de mensagem." });
        }
    }

    async reabrirTicket(req: Request, res: Response) {
        const { id } = req.params;
        try {
            await prisma.message.update({
                where: { id: Number(id) },
                data: { status: 'em espera' }
            });
            return res.json({ message: "Ticket reaberto com sucesso!" });
        } catch (error) {
            return res.status(500).json({ error: "Erro ao reabrir ticket." });
        }
    }
}