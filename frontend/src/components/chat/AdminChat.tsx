import { useState, useEffect, useRef, useContext } from 'react';
import api from '../../services/api';
import { AuthContext, type Chat } from '../../contexts/AuthContext';


export const AdminChatDashboard = () => {
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null); // Chat aberto no momento
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const { user, chats, setChats, socket } = useContext(AuthContext);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isImage = (url: string) => url.match(/\.(jpeg|jpg|gif|png)$/i);

    useEffect(() => {
        // Se não tiver chat selecionado, não faz nada
        if (!selectedChat?.id) return;

        // Acha a versão mais recente do chat aberto que está no contexto
        const atualizado = chats.find((c: any) => c.id === selectedChat.id);

        // Só atualiza o estado local se o número de mensagens mudou
        if (atualizado && atualizado.mensagem.length !== selectedChat.mensagem.length) {
            setSelectedChat(atualizado);
        }
    }, [chats]);

    const fetchActiveChats = async () => {
        const res = await api.get('/admin/chats/ativos');
        setChats(res.data); // Atualiza o contexto, o contexto avisa o resto
    };

    useEffect(() => {
        fetchActiveChats();
    }, []);

    const selectedChatRef = useRef(selectedChat);

    useEffect(() => {
        selectedChatRef.current = selectedChat;
    }, [selectedChat]);

    // Scroll automático
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedChat?.mensagem]);

    const handleSendMessage = async () => {
        if (!input.trim() || !selectedChat || isSending) return;
        setIsSending(true);

        try {
            const payload = {
                chatId: selectedChat.id,
                autor: 'admin',
                nome: user?.nome_completo, // Primeiro nome do admin via AuthContext
                mensagem: input,
                criadoEm: new Date().toISOString()
            };
            await api.post(`/messages/${selectedChat.id}/reply`, payload);

            setInput('');
            fetchActiveChats();
        } catch (e) {
            alert("Erro ao responder.");
        } finally {
            setIsSending(false);
        }
    };

    const getFirstName = (name: string) => name ? name.split(' ')[0] : 'Usuário';

    const handleCloseChat = async () => {
        if (!selectedChat) return;
        if (!window.confirm("Deseja realmente encerrar este atendimento?")) return;

        socket.emit('encerrar_chat_admin', { chatId: selectedChat.id });

        setSelectedChat(null);

        setTimeout(() => {
            fetchActiveChats();
        }, 300);
    };

    const handleAdminFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedChat || isUploading) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            // 1. Upload para o Cloudinary
            const uploadRes = await api.post('/chat/upload', formData);
            const { url, type } = uploadRes.data;

            // 2. Resposta via API (que aciona o socket no backend)
            const payload = {
                chatId: selectedChat.id,
                autor: 'admin',
                nome: user?.nome_completo,
                mensagem: url,
                isArquivo: true,
                tipoArquivo: type,
                criadoEm: new Date().toISOString()
            };

            await api.post(`/messages/${selectedChat.id}/reply`, payload);

            fetchActiveChats(); // Atualiza a lista lateral
        } catch (error) {
            alert("Erro ao enviar arquivo.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="mt-6 flex h-[calc(100vh-80px)] bg-[#0B0E11] text-white overflow-hidden border border-gray-800 rounded-xl">
            {/* BARRA LATERAL: LISTA DE CLIENTES */}
            <div className="w-80 border-r border-gray-800 flex flex-col bg-neutral-grayish-dark">
                <div className="p-4 border-b border-gray-800">
                    <h2 className="text-orange-combat font-black uppercase tracking-widest text-sm">Mensagens Ativas</h2>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {chats.length === 0 && <p className="p-4 text-gray-500 text-xs text-center">Nenhum chat pendente.</p>}
                    {chats.map((chat) => {
                        const mensagens = chat.mensagem || [];
                        const ultimaMsg = mensagens[mensagens.length - 1];

                        // Critério para mostrar o Badge:
                        // 1. A última mensagem é do usuário
                        // 2. O chat NÃO é o que está selecionado no momento
                        const temNovidade = ultimaMsg?.autor === 'user' && selectedChat?.id !== chat.id;

                        return (
                            <div
                                key={chat.id}
                                onClick={() => setSelectedChat(chat)}
                                className={`relative p-4 border-b border-gray-800 cursor-pointer transition-all ${selectedChat?.id === chat.id ? 'bg-orange-combat/10' : 'hover:bg-white/5'
                                    }`}
                            >
                                {/* Badge Laranja de "Não Lido" */}
                                {temNovidade && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <span className="flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-combat opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-combat shadow-sm shadow-orange-900"></span>
                                        </span>
                                    </div>
                                )}

                                <div className="pr-6"> {/* Espaço para o badge não sobrepor o texto */}
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-sm ${temNovidade ? 'font-black text-white' : 'font-bold text-gray-300'}`}>
                                            {chat.usuario?.nome_completo || 'Cliente'}
                                        </span>
                                        <span className="text-[9px] text-gray-500 font-mono">
                                            {new Date(chat.atualizadoEm).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className={`text-xs truncate ${temNovidade ? 'text-gray-200 font-medium' : 'text-gray-500'}`}>
                                        {ultimaMsg?.isArquivo || ultimaMsg?.mensagem?.includes('cloudinary')
                                            ? (isImage(ultimaMsg.mensagem) ? "🖼️ Foto enviada" : "📄 Documento enviado")
                                            : (ultimaMsg?.mensagem || "Sem mensagens")}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ÁREA PRINCIPAL: CONVERSA SELECIONADA */}
            <div className="flex-1 flex flex-col bg-black/40">
                {selectedChat ? (
                    <>
                        {/* Header do Chat */}
                        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-neutral-grayish-dark">
                            <div>
                                <h3 className="font-bold text-orange-combat">{selectedChat.usuario?.nome_completo}</h3>
                                <p className="text-[10px] text-gray-500 uppercase">{selectedChat.usuario?.email}</p>
                            </div>
                            <button
                                onClick={() => handleCloseChat()}
                                className="text-[10px] bg-gray-800 hover:bg-red-900 px-3 py-1 rounded transition-colors"
                            >
                                ENCERRAR ATENDIMENTO
                            </button>
                        </div>

                        {/* Mensagens */}
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar">
                            {selectedChat.mensagem.map((msg: any, idx: number) => {
                                const isMe = msg.autor === 'admin';
                                return (
                                    <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <span className="text-[9px] uppercase font-black text-gray-600 mb-1 px-1">
                                            {isMe ? `🛡️ ${getFirstName(msg.nome)} (Você)` : getFirstName(msg.nome)}
                                        </span>
                                        <div className={`p-3 rounded-2xl max-w-[70%] shadow-md ${isMe ? 'bg-orange-combat text-white rounded-tr-none' : 'bg-neutral-grayish border border-gray-700 text-white rounded-tl-none'
                                            }`}>
                                            {msg.isArquivo || msg.mensagem?.includes('res.cloudinary.com') ? (
                                                isImage(msg.mensagem) ? (
                                                    <img
                                                        src={msg.mensagem}
                                                        alt="Upload"
                                                        className="max-w-full rounded-lg cursor-pointer hover:scale-[1.02] transition-transform"
                                                        onClick={() => window.open(msg.mensagem, '_blank')}
                                                    />
                                                ) : (
                                                    <a href={msg.mensagem} target="_blank" className="flex items-center gap-2 text-xs underline bg-black/30 p-2 rounded">
                                                        📂 Documento/Arquivo recebido
                                                    </a>
                                                )
                                            ) : (
                                                <p className="text-sm leading-relaxed">{msg.mensagem}</p>
                                            )}

                                            <span className="block text-[8px] mt-1 opacity-70 text-right">
                                                {new Date(msg.criadoEm).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input de Resposta */}
                        <div className="p-4 border-t border-gray-800 bg-neutral-grayish-dark">
                            <div className="flex gap-2">
                                <input type="file" ref={fileInputRef} onChange={handleAdminFileUpload} className="hidden" />

                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-gray-800 px-4 rounded-xl hover:bg-gray-700 transition"
                                >
                                    📎
                                </button>

                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder={`Responder para ${getFirstName(selectedChat.usuario?.nome_completo)}...`}
                                    className="flex-1 bg-black/40 border border-gray-700 rounded-xl p-3 text-sm text-white outline-none focus:border-orange-combat"
                                    disabled={isUploading}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={isSending}
                                    className="bg-orange-combat px-6 rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors disabled:opacity-50"
                                >
                                    ENVIAR
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-600 uppercase tracking-widest text-sm">
                        Selecione uma conversa para iniciar o atendimento
                    </div>
                )}
            </div>
        </div>
    );
};