import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import api from "../../services/api";

interface EnviarArquivo {
    name: any;
    url: any;
}

interface Message {
    id?: number;
    assunto: string;
    mensagem: any[];
    status: 'em espera' | 'respondida' | 'fechado';
    enviarArquivo: EnviarArquivo[];
    criadoEm?: any;
    atualizadoEm?: any;
}

interface NewMessageState {
    assunto: string;
    mensagem: any;
    status: string;
    criadoEm: string;
    atualizadoEm?: string;
    enviarArquivo: File[];
}

export const EnviarMensagem = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [_selectedFile, setSelectedFile] = useState<File | null>(null);
    const [mensagemAbertaId, setMensagemAbertaId] = useState<number | null>(null);
    const [respostas, setRespostas] = useState<{ [key: number]: string }>({});

    const [abaAtiva, setAbaAtiva] = useState<'fila' | 'historico'>('fila');

    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const ticketsAbertos = messages.filter(m => m.status !== 'fechado');
    const ticketsEncerrados = messages.filter(m => m.status === 'fechado');

    const chatEndRef = useRef<HTMLDivElement>(null);

    const [newMessage, setNewMessage] = useState<NewMessageState>({
        assunto: '',
        mensagem: '',
        status: 'em espera',
        criadoEm: '',
        enviarArquivo: []
    });

    const { setGlobalLoading, isAdmin } = useContext(AuthContext);

    const mensagensExibidas = messages.filter(msg => {
        if (abaAtiva === 'fila') {
            return msg.status !== 'fechado';
        } else {
            return msg.status === 'fechado';
        }
    })

    const fetchMessage = async () => {
        const res = await api.get(`/messages`);
        setMessages(res.data);
    }

    useEffect(() => {
        fetchMessage();
    }, []);

    useEffect(() => {
        if (mensagemAbertaId) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [mensagemAbertaId, messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();

        formData.append('assunto', newMessage.assunto);
        formData.append('status', newMessage.status);

        const mensagemInicial = [
            {
                autor: 'user',
                mensagem: newMessage.mensagem,
                criadoEm: new Date().toISOString()
            }
        ];

        formData.append('mensagem', JSON.stringify(mensagemInicial));

        newMessage.enviarArquivo.forEach((file) => {
            formData.append('enviarArquivo', file);
        });

        setGlobalLoading(true);
        try {
            await api.post('/messages', formData);

            alert('Mensagem enviada com sucesso!');
            setNewMessage({ ...newMessage, assunto: '', mensagem: '' });
            setMostrarFormulario(false);
            fetchMessage();

        } catch (error) {
            alert('Erro ao enviar mensagem. Tente novamente.');

        } finally {
            setGlobalLoading(false);
        }
    }

    const handleToggleMessage = (id: number) => {
        setMensagemAbertaId(mensagemAbertaId === id ? null : id);
    };

    const handleEnviarReplica = async (messageId: number) => {
        const textoParaEnviar = respostas[messageId];

        if (!textoParaEnviar?.trim()) {
            alert('Por favor, escreva uma mensagem antes de enviar.');
            return;
        }

        setGlobalLoading(true);

        try {

            const payload = {
                autor: isAdmin === true ? 'admin' : 'user',
                mensagem: textoParaEnviar,
                criadoEm: new Date().toISOString()
            };

            await api.post(`/messages/${messageId}/reply`, payload);

            setRespostas({ ...respostas, [messageId]: '' });

            fetchMessage();
        } catch (error) {
            console.error("Erro ao enviar resposta:", error);
            alert('Erro ao enviar sua resposta. Tente novamente.');
        } finally {
            setGlobalLoading(false);
        }
    }

    const handleDeleteMessage = async (messageId: number) => {
        if (!window.confirm('Tem certeza que deseja excluir esta mensagem? .')) {
            return;
        }

        setGlobalLoading(true);
        try {
            await api.delete(`/message/${messageId}`);
            alert('Mensagem excluída com sucesso!');
            fetchMessage();
        } catch (error) {
            console.error("Erro ao excluir mensagem:", error);
            alert('Erro ao excluir a mensagem. Tente novamente.');
        } finally {
            setGlobalLoading(false);
        }
    }

    const handleFecharTicket = async (messageId: number) => {
        if (!window.confirm("Deseja realmente fechar este atendimento?")) return;

        setGlobalLoading(true);
        try {
            await api.patch(`/messages/${messageId}/close`);
            alert("Ticket fechado com sucesso!");
            fetchMessage();
        } catch (error) {
            console.error("Erro ao fechar ticket:", error);
        } finally {
            setGlobalLoading(false);
        }
    }

    const handleReabrirTicket = async (messageId: number) => {
        if (!window.confirm("Deseja reabrir este atendimento para novas respostas? "))

            setGlobalLoading(true);
        try {
            await api.patch(`/messages/${messageId}/reopen`);
            alert("Ticket reaberto! Ele volto para a Fila de Atendimento.");
            fetchMessage();
        } catch (error) {
            console.error("Erro ao reabrir ticket:", error);
            alert("Erro ao reabrir o ticket.");
        } finally {
            setGlobalLoading(false);
        }
    }

    const renderTicketCard = (message: Message, isFechado: boolean = false) => {
        const isVisivel = mensagemAbertaId === message.id;

        return (
            <div
                key={message.id}
                className={`border-l-2 ${isFechado ? 'border-gray-600 bg-neutral-grayish' : 'border-orange-combat bg-neutral-grayish-dark'} shadow-sm flex flex-col p-4 justify-between transition-all`}
            >
                <div className="w-full flex gap-4 justify-between max-[1139px]:flex-col">

                    <div className="flex flex-col gap-2 items-center">
                        <h4 className={`text-xs uppercase font-bold ${isFechado ? 'text-gray-400' : 'text-orange-combat'}`}>
                            {message.assunto}
                        </h4>

                        <p className="text-[10px] uppercase font-bold bg-gray-800 px-2 py-1 w-fit">
                            Status: {message.status}
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 mt-2">
                        {message.enviarArquivo && message.enviarArquivo.length > 0 && (
                            <div className="flex flex-col gap-2">
                                <h5 className="text-xs text-orange-combat uppercase font-bold">Anexos:</h5>
                                {message.enviarArquivo.map((arquivo, index) => (
                                    <a
                                        key={index}
                                        href={arquivo.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 p-1 w-fit rounded transition-all group"
                                    >
                                        <span className="text-orange-combat text-xs">📎</span>
                                        <span className="text-[10px] text-white truncate max-w-37.5">
                                            {arquivo.name || `Arquivo ${index + 1}`}
                                        </span>
                                        <span className="text-[9px] text-orange-combat font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                            Abrir
                                        </span>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <h4 className="text-xs text-orange-combat uppercase font-bold">Criado em:</h4>

                        <p className="text-[10px] text-gray-500">
                            {new Date(message.criadoEm).toLocaleDateString()}
                        </p>
                        <p className="text-[10px] text-gray-500">
                            às {new Date(message.criadoEm).toLocaleTimeString()}
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <h4 className="text-xs text-orange-combat uppercase font-bold">Atualizado em:</h4>

                        <p className="text-[10px] text-gray-500">
                            {new Date(message.atualizadoEm).toLocaleDateString()}
                        </p>
                        <p className="text-[10px] text-gray-500">
                            às {new Date(message.atualizadoEm).toLocaleTimeString()}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 ">
                        {message.status === 'respondida' && (
                            <div className="w-full flex flex-col items-end gap-2 max-[610px]:items-center">
                                <button onClick={() => handleToggleMessage(message.id!)} className="cursor-pointer bg-orange-combat hover:bg-gray-700 py-1 px-3 text-xs transition-all">{isVisivel ? 'Fechar' : 'Responder'}</button>
                            </div>
                        )}

                        {message.status === 'em espera' && (
                            <div className="w-full flex flex-col items-end gap-2 max-[1139px]:items-center">
                                <button onClick={() => handleToggleMessage(message.id!)} className="cursor-pointer bg-orange-combat hover:bg-gray-700 py-1 px-3 text-xs " >{isVisivel ? 'Fechar' : 'Responder'}</button>

                                <button onClick={() => handleDeleteMessage(message.id!)} className="cursor-pointer bg-orange-combat hover:bg-gray-700 py-1 px-3 text-xs ">Excluir</button>
                            </div>

                        )}

                        {message.status === 'fechado' && (
                            <div className="flex flex-col gap-2">
                                <button onClick={() => handleToggleMessage(message.id!)} className="cursor-pointer bg-gray-900 hover:bg-gray-700 py-1 px-3 text-xs " >{isVisivel ? 'Fechar' : 'Visualizar'}</button>
                            </div>
                        )}
                    </div>

                </div>
                {isVisivel && (
                    <div className="mt-4 p-4 bg-neutral-grayish border-t border-gray-700 animate-fade-in">

                        {/* LISTAGEM DAS MENSAGENS (O CHAT) */}
                        <div className="flex flex-col gap-3 mb-4 max-h-80 overflow-y-auto p-2 bg-black/20 rounded border border-gray-800 custom-scrollbar">
                            {Array.isArray(message.mensagem) && message.mensagem.map((msg: any, idx: number) => (
                                <div key={idx} className={`flex flex-col w-full ${msg.autor === 'admin' ? 'items-start' : 'items-end'}`}>
                                    <span className="text-[9px] uppercase font-bold text-gray-500 mb-1 px-1">
                                        {msg.autor === 'admin' ? '🛡️ Atendente Combat' : '👤 Você'}
                                    </span>
                                    <div
                                        className={`relative p-3 rounded-2xl max-w-[85%] sm:max-w-[70%] text-sm shadow-md ${msg.autor === 'admin'
                                            ? 'bg-neutral-grayish border border-gray-700 rounded-tl-none text-white'
                                            : 'bg-orange-combat text-white rounded-tr-none'
                                            }`}
                                    >
                                        <p className="leading-relaxed wrap-break-word">{msg.mensagem}</p>

                                        {/* Data/Hora dentro da bolha, no cantinho */}
                                        <span className={`block text-[8px] mt-2 opacity-70 text-right`}>
                                            {msg.criadoEm ? new Date(msg.criadoEm).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        {/* CAMPO DE RESPOSTA (SÓ APARECE SE NÃO ESTIVER FECHADO) */}
                        {!isFechado && (
                            <div className="flex flex-col gap-2">
                                <textarea
                                    placeholder="Digite sua resposta..."
                                    className="bg-gray-900 border border-gray-700 p-2 text-xs text-white h-16 resize-none"
                                    value={respostas[message.id!] || ""}
                                    onChange={(e) => setRespostas({ ...respostas, [message.id!]: e.target.value })}
                                />
                                <button
                                    onClick={() => handleEnviarReplica(message.id!)}
                                    className="cursor-pointer bg-orange-combat hover:bg-gray-700 text-xs py-1 px-4 self-end"
                                >
                                    Enviar Resposta
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div>
            {isAdmin ? (
                <div className="my-5 w-full flex flex-col gap-5">
                    <div className="flex flex-col items-center justify-center">
                        <h3 className="mb-2.5 text-orange-combat font-semibold text-[18px]">Painel de Tickets (Admin)</h3>
                        <p className="text-xs text-gray-500 text-center max-w-xl">
                            Gerencie as solicitações dos clientes. Clique em "Responder" para abrir a conversa e enviar uma solução.
                        </p>
                    </div>

                    <div className="flex gap-2 border-b border-gray-800">
                        <button
                            onClick={() => setAbaAtiva('fila')}
                            className={`cursor-pointer px-4 py-2 font-bold transition-all ${abaAtiva === 'fila' ? 'text-orange-combat' : 'text-gray-500'}`}
                        >
                            Fila de Atendimento ({messages.filter(m => m.status !== 'fechado').length})
                        </button>
                        <button
                            onClick={() => setAbaAtiva('historico')}
                            className={`cursor-pointer px-4 py-2 font-bold transition-all ${abaAtiva === 'historico' ? 'text-orange-combat' : 'text-gray-500'}`}
                        >
                            Histórico/Fechados
                        </button>
                    </div>

                    {mensagensExibidas.length === 0 ? (
                        <div className="mt-10 flex flex-col items-center opacity-50 text-center">
                            <div className="text-3xl mb-4">📂</div>
                            <h4 className="font-semibold">Nenhum ticket pendente</h4>
                        </div>
                    ) : (
                        <div className="w-full">
                            {mensagensExibidas.map((message) => {
                                const isVisivel = mensagemAbertaId === message.id;

                                return (

                                    <div key={message.id} className="border-l-2 border-orange-combat bg-neutral-grayish-dark shadow-sm flex justify-between mb-4 p-4 flex-col">
                                        <div className="w-full flex gap-4 justify-between max-[610px]:flex-col">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] bg-orange-combat px-2 py-0.5 rounded font-bold text-white uppercase">ID: {message.id}</span>
                                                    <h4 className="text-xs text-orange-combat uppercase font-bold">{message.assunto}</h4>
                                                </div>
                                                <p className="text-[10px] uppercase font-bold bg-gray-800 px-2 py-1 w-fit">
                                                    Status: {message.status}
                                                </p>
                                            </div>

                                            {/* EXIBIÇÃO DE ANEXOS DO USUÁRIO PARA O ADMIN */}
                                            <div className="flex flex-col gap-2 mt-2">
                                                {message.enviarArquivo && message.enviarArquivo.length > 0 && (
                                                    <div className="flex flex-col gap-1">
                                                        <h5 className="text-[9px] text-gray-400 uppercase font-bold">Anexos do Cliente:</h5>
                                                        {message.enviarArquivo.map((arquivo, index) => (
                                                            <a
                                                                key={index}
                                                                href={arquivo.url.replace('/upload/', '/upload/fl_attachment/')}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 p-1 w-fit rounded transition-all group"
                                                            >
                                                                <span className="text-orange-combat text-xs">📎</span>
                                                                <span className="text-[9px] text-white truncate max-w-32">{arquivo.name || "Arquivo"}</span>
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-1 text-right max-[610px]:text-left">
                                                <h4 className="text-[9px] text-gray-500 uppercase font-bold">Data da Solicitação:</h4>
                                                <p className="text-[10px] text-gray-400">
                                                    {new Date(message.criadoEm).toLocaleDateString()} às {new Date(message.criadoEm).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            {message.status === 'fechado' ? (
                                                <div className="flex items-center">
                                                    <button
                                                        onClick={() => handleReabrirTicket(message.id!)}
                                                        className="cursor-pointer bg-orange-combat hover:bg-gray-700  py-1 px-4 text-xs transition-all"
                                                    >
                                                        Reabrir Ticket
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-2">
                                                    <button
                                                        onClick={() => handleToggleMessage(message.id!)}
                                                        className="cursor-pointer bg-orange-combat hover:bg-gray-700  py-1 px-4 text-xs transition-all"
                                                    >
                                                        {isVisivel ? 'Fechar' : 'Responder'}
                                                    </button>

                                                    <button
                                                        onClick={() => handleFecharTicket(message.id as any)}
                                                        className="cursor-pointer bg-orange-combat hover:bg-gray-700  py-1 px-4 text-xs transition-all"
                                                    >
                                                        Fechar Ticket
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* THREAD DE CONVERSA (ADMIN) */}
                                        {isVisivel && (
                                            <div className="mt-4 p-4 bg-neutral-grayish border-t border-gray-700 animate-fade-in">
                                                <div className="flex flex-col gap-3 mb-4 max-h-80 overflow-y-auto p-2 bg-black/20 rounded border border-gray-800 custom-scrollbar">
                                                    {Array.isArray(message.mensagem) && message.mensagem.map((msg: any, idx: number) => {
                                                        const isMeAdmin = msg.autor?.toLowerCase() === 'admin';
                                                        return (
                                                            <div key={idx} className={`flex flex-col w-full ${isMeAdmin ? 'items-end' : 'items-start'}`}>
                                                                <span className="text-[9px] uppercase font-bold text-gray-500 mb-1 px-1">
                                                                    {isMeAdmin ? '🛡️ Você (Atendente)' : '👤 Cliente'}
                                                                </span>
                                                                <div className={`relative p-3 rounded-2xl max-w-[85%] text-sm shadow-md ${isMeAdmin
                                                                    ? 'bg-orange-combat text-white rounded-tr-none'
                                                                    : 'bg-neutral-grayish border border-gray-700 rounded-tl-none text-white'
                                                                    }`}>
                                                                    <p className="leading-relaxed wrap-break-word">{msg.mensagem}</p>
                                                                    <span className="block text-[8px] mt-2 opacity-70 text-right">
                                                                        {new Date(msg.criadoEm).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                    <div ref={chatEndRef} />
                                                </div>

                                                {/* CAMPO DE RESPOSTA DO ADMIN */}
                                                <div className="flex flex-col gap-2 border-t border-gray-700 pt-3">
                                                    <textarea
                                                        placeholder="Digite a resposta oficial para o cliente..."
                                                        className="bg-gray-900 border border-gray-700 p-2 text-xs outline-none focus:border-orange-combat h-20 resize-none text-white"
                                                        value={respostas[message.id!] || ""}
                                                        onChange={(e) => setRespostas({ ...respostas, [message.id!]: e.target.value })}
                                                    />
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[9px] text-gray-500 italic">* O cliente será notificado da resposta.</span>
                                                        <button
                                                            onClick={() => handleEnviarReplica(message.id!)}
                                                            className="bg-orange-combat text-xs py-1.5 px-6 hover:bg-gray-700 hover:text-orange-combat transition-all"
                                                        >
                                                            Enviar Resposta ao CLiente
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            ) : (

                <div>

                    <div className="my-5 flex flex-col items-center justify-center">
                        <h3 className="mb-2.5 text-orange-combat font-semibold text-[18px] ">Falar com um atendente</h3>

                        <p>
                            As mensagens enviadas por aqui <span className="text-orange-combat">serão respondidas por nossos atendentes o mais breve possível</span>. Por favor, seja claro e objetivo em sua mensagem para que possamos ajudá-lo da melhor forma possível. Se você tiver arquivos relacionados ao seu pedido ou dúvida, sinta-se à vontade para anexá-los usando o campo de upload. Estamos aqui para ajudar!
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <button onClick={() => setMostrarFormulario(!mostrarFormulario)} className="cursor-pointer bg-orange-combat text-white py-2 px-4 hover:bg-gray-700 transition-all">Abrir Ticket</button>
                    </div>

                    <div className={`formulario ${mostrarFormulario ? 'active' : ''} w-full max-w-275 bg-neutral-dark-grayish border border-gray-800 p-6 max-[610px]:p-2 flex flex-col gap-5`}>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <input
                                type="text"
                                placeholder="Assunto"
                                value={newMessage.assunto}
                                onChange={(e) => setNewMessage({ ...newMessage, assunto: e.target.value })}
                                className="p-1 mr-2 text-sm bg-neutral-grayish border border-gray-700 focus:border-orange-combat outline-none transition-colors resize-none"
                                required
                            />
                            <textarea
                                placeholder="Mensagem"
                                value={newMessage.mensagem}
                                onChange={(e) => setNewMessage({ ...newMessage, mensagem: e.target.value })}
                                className="p-1 mr-2 text-sm bg-neutral-grayish border border-gray-700 focus:border-orange-combat outline-none transition-colors resize-none"
                                required
                            />
                            <input
                                type="file"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        const filesArray = Array.from(e.target.files);

                                        setSelectedFile(filesArray[0]);
                                        setNewMessage({
                                            ...newMessage,
                                            enviarArquivo: filesArray
                                        });
                                    }
                                }}
                                className="p-1 mr-2 text-sm bg-neutral-grayish border border-gray-700 focus:border-orange-combat outline-none transition-colors resize-none"
                            />
                            <div className="flex justify-center">
                                <button type="submit" className="cursor-pointer bg-orange-combat text-white py-2 px-12 w-fit hover:bg-gray-700 transition-all">Enviar</button>
                            </div>
                        </form>

                    </div>

                    <div className="flex flex-col gap-8">

                        {/* SEÇÃO: TICKETS EM ANDAMENTO */}
                        <section>
                            <div className="flex items-center gap-2 mb-4 border-b border-orange-combat/30 pb-2 mt-4">
                                <h3 className="text-orange-combat font-semibold text-[16px] uppercase tracking-wider">Atendimentos Ativos</h3>
                                <span className="bg-orange-combat text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                    {ticketsAbertos.length}
                                </span>
                            </div>

                            {ticketsAbertos.length === 0 ? (
                                <p className="text-gray-500 text-xs italic">Nenhum atendimento em aberto no momento.</p>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {ticketsAbertos.map((message) => renderTicketCard(message))}
                                </div>
                            )}
                        </section>

                        {/* SEÇÃO: HISTÓRICO DE RESOLVIDOS */}
                        {ticketsEncerrados.length > 0 && (
                            <section className="">
                                <div className="flex items-center gap-2 mb-4 border-b border-gray-700 pb-2">
                                    <h3 className="text-gray-400 font-semibold text-[16px] uppercase tracking-wider">Histórico (Encerrados)</h3>
                                </div>

                                <div className="flex flex-col gap-4 hover:opacity-100 transition-opacity opacity-60">
                                    {ticketsEncerrados.map((message) => renderTicketCard(message, true))}
                                </div>
                            </section>
                        )}
                    </div>

                    {messages.length === 0 ? (
                        <div className="mt-10 flex flex-col items-center opacity-50 text-center">
                            <div className="text-6xl mb-4">✉️</div>
                            <h4 className="text-lg font-semibold">Nenhum ticket por aqui</h4>
                            <p className="text-sm">Se precisar de ajuda, abra um novo formulário acima.</p>
                        </div>
                    ) : (
                        ''
                    )}

                </div>

            )}
        </div>
    )
}