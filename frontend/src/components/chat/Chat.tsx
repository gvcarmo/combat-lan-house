import { useState, useEffect, useRef, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';

export const ChatWidget = ({
    externalOpen,
}: {
    externalOpen?: boolean,
    setExternalOpen?: (v: boolean) => void
}) => {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [activeTicketId, setActiveTicketId] = useState<number | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [isSending, setIsSending] = useState(false);
    const [isFileUploading, setIsFileUploading] = useState(false);

    const { user, isAdmin, socket } = useContext(AuthContext);

    const audioChat = new Audio('./notificacao.mp3');

    const isOpen = externalOpen;

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && chatEndRef.current) {
            const timer = setTimeout(() => {
                chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [messages, isOpen]);

    useEffect(() => {
        // 1. Tenta carregar o chat do localStorage assim que o componente monta
        const carregarTudo = async () => {
            await iniciarChat();      // Tenta pegar o ID do localStorage
            await fetchOrCreateChat(); // Busca no banco para ver se há chats abertos
        };

        carregarTudo();

        // 2. Ouvir novas mensagens (Sua lógica atual)
        const handleNovaMensagem = (data: any) => {
            // O cliente só se importa se a mensagem for do chat DELE
            if (activeTicketId === data.id) {
                setMessages(data.mensagem || []);

                // Som para o cliente se o admin respondeu
                const ultimaMsg = data.mensagem[data.mensagem.length - 1];
                if (ultimaMsg.autor === 'admin') {
                    audioChat.play().catch(() => { });
                }
            }
        };

        // 3. Ouvir o comando de encerramento do Admin
        const handleEncerramento = (data: { chatId: number }) => {
            // Se o admin encerrou este chat específico
            if (activeTicketId === data.chatId) {
                localStorage.removeItem('activeChatId');
                setActiveTicketId(null);

                setTimeout(() => {
                    setActiveTicketId(null);
                    setMessages([]);
                }, 4000);
            }
        };

        socket.on('nova_mensagem_chat', handleNovaMensagem);
        socket.on('chat_encerrado', handleEncerramento);

    }, [activeTicketId, socket]);

    const fetchOrCreateChat = async () => {
        try {
            const res = await api.get('/messages');
            const chatAberto = res.data.find((m: any) => m.assunto === 'CHAT_SUPORTE' && m.status !== 'fechado');

            if (chatAberto) {
                setActiveTicketId(chatAberto.id);
                setMessages(chatAberto.mensagem || []);
                // Garantia: salva no localStorage se o banco achou algo que o navegador esqueceu
                localStorage.setItem('activeChatId', String(chatAberto.id));
            }
        } catch (e) { console.error(e); }
    };

    // 2. Enviar mensagem (reaproveitando sua lógica de réplica)
    const handleSendMessage = async () => {
        if (!input.trim() || isSending) return;

        setIsSending(true);
        const timestamp = new Date().toISOString();

        try {
            let currentId = activeTicketId;

            if (currentId) {
                try {
                    const check = await api.get(`/chat/${currentId}`);
                    if (check.data.status === 'fechado' || check.data.status === 'finalizado') {
                        currentId = null; // Força a criação de um novo ticket abaixo
                        localStorage.removeItem('activeChatId');
                    }
                } catch (e) {
                    currentId = null;
                }
            }

            if (!currentId) {
                const formData = new FormData();
                formData.append('assunto', 'CHAT_SUPORTE');
                formData.append('mensagem', JSON.stringify([{
                    autor: 'user',
                    nome: user?.nome_completo,
                    mensagem: input,
                    criadoEm: timestamp
                }]));

                const res = await api.post('/messages', formData);
                setActiveTicketId(res.data.id);
                currentId = res.data.id;
                localStorage.setItem('activeChatId', String(res.data.id));
                setMessages(res.data.mensagem);
            } else {
                // 2. Se JÁ tem ticket, envia via SOCKET para ser tempo real
                const payload = {
                    chatId: currentId, // O ID que o backend Postgres precisa
                    autor: 'user',
                    nome: user?.nome_completo || 'Cliente',
                    mensagem: input,
                    criadoEm: timestamp
                };

                socket.emit('enviar_mensagem', payload);
            }
            setInput('');
        } catch (e) {
            console.error(e);
            alert("Erro ao enviar mensagem.");
        } finally {
            setIsSending(false);
        }
    };

    const getFirstName = (fullName: string) => {
        return fullName ? fullName.split(' ')[0] : 'Usuário';
    };

    const iniciarChat = async () => {
        const chatSalvoId = localStorage.getItem('activeChatId');

        if (chatSalvoId) {
            try {
                const res = await api.get(`/chat/${chatSalvoId}`);
                setMessages(res.data.mensagem);
                // IMPORTANTE: Atualize o estado que o seu useEffect usa!
                setActiveTicketId(Number(chatSalvoId));
            } catch (err) {
                // Se der erro (chat expirado no banco, por ex), limpa o storage
                localStorage.removeItem('activeChatId');
            }
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeTicketId) return;

        setIsFileUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            // 1. Envia para o Cloudinary através da sua rota no backend
            const res = await api.post('/chat/upload', formData);
            const { url, type } = res.data;

            // 2. Emite via Socket com a flag de arquivo
            const payload = {
                chatId: activeTicketId,
                autor: isAdmin ? 'admin' : 'user',
                nome: user?.nome_completo || 'Usuário',
                mensagem: url, // A URL vira o conteúdo da mensagem
                isArquivo: true,
                tipoArquivo: type, // 'image' ou 'document'
                criadoEm: new Date().toISOString()
            };

            socket.emit('enviar_mensagem', payload);
        } catch (err) {
            console.error("Erro no upload:", err);
            alert("Falha ao enviar arquivo.");
        } finally {
            setIsFileUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="fixed bottom-5 right-5 z-50">
            {/* Janela do Chat */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-80 h-96 bg-neutral-grayish-dark border border-gray-700 rounded-lg shadow-2xl flex flex-col overflow-hidden animate-fade-in max-[321px]:w-70">
                    <div className="bg-orange-combat p-3 font-bold text-xs uppercase">Suporte Online</div>

                    {/* Área de Mensagens */}
                    <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 custom-scrollbar">

                        {messages.length === 0 && (
                            <p className="text-gray-500 text-[10px] text-center mt-10 uppercase">Inicie uma conversa com nossa equipe.</p>
                        )}

                        {messages.map((msg, idx) => {
                            const isMe = isAdmin ? msg.autor === 'admin' : msg.autor === 'user';
                            const nomeExibicao = getFirstName(
                                msg.nome || (msg.autor === 'admin' ? 'Atendente' : 'Cliente')
                            );

                            return (
                                <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    {/* Nome do Autor */}
                                    <span className="text-[9px] uppercase font-black text-gray-500 mb-1 px-1">
                                        {isMe ? 'Você' : (msg.autor === 'admin' ? `🛡️ ${nomeExibicao}` : nomeExibicao)}
                                    </span>

                                    {/* Bolha */}
                                    <div className={`relative p-3 rounded-2xl max-w-[85%] shadow-md ${isMe
                                        ? 'bg-orange-combat text-white rounded-tr-none'
                                        : 'bg-neutral-grayish border border-gray-700 text-white rounded-tl-none'
                                        }`}>
                                        {msg.isArquivo || msg.mensagem.includes('res.cloudinary.com') ? (
                                            msg.tipoArquivo === 'image' || msg.mensagem.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                                                <img
                                                    src={msg.mensagem}
                                                    alt="Upload"
                                                    className="max-w-full rounded-lg cursor-pointer hover:opacity-90"
                                                    onClick={() => window.open(msg.mensagem, '_blank')}
                                                />
                                            ) : (
                                                <a
                                                    href={msg.mensagem}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-2 text-[11px] underline bg-black/20 p-2 rounded"
                                                >
                                                    📁 Documento/Arquivo (Baixar)
                                                </a>
                                            )
                                        ) : (
                                            <p className="text-sm leading-relaxed wrap-break-word">{msg.mensagem}</p>
                                        )}

                                        {/* Hora Formatada */}
                                        <span className="block text-[8px] mt-1 opacity-70 text-right font-medium">
                                            {new Date(msg.criadoEm).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}

                        <div ref={chatEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-2 border-t border-gray-700 flex gap-2">
                        {isFileUploading && (
                            <span className="text-[9px] text-orange-combat animate-pulse px-1">📤 Enviando arquivo...</span>
                        )}
                        <div className="flex gap-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                className="hidden"
                                accept="image/*,.pdf,.doc,.docx,.txt"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="text-gray-400 hover:text-white transition px-1"
                                title="Anexar arquivo"
                            >
                                📎
                            </button>
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                className="w-40 flex-1 bg-black/20 border border-gray-700 p-2 text-xs text-white outline-none"
                                placeholder="Digite sua dúvida..."
                                disabled={isFileUploading}
                            />
                            <button
                                onClick={handleSendMessage}
                                className="bg-orange-combat px-3 text-xs font-bold disabled:opacity-50"
                                disabled={isFileUploading}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};