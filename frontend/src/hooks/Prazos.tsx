import { useContext, useEffect, useState, useCallback } from "react";
import { AuthContext } from "../contexts/AuthContext";

export const Prazos = () => {
    const [aviso, setAviso] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [tempAviso, setTempAviso] = useState("");
    const [isAdminOnline, setIsAdminOnline] = useState(false);
    const [isManual, setIsManual] = useState(false);

    const { checkingAuth, isLogged, isAdmin, socket } = useContext(AuthContext);

    const definirMensagemPorStatus = useCallback((online: boolean, forcar: boolean = false) => {
        setIsAdminOnline(online);

        // Só altera se NÃO for manual OU se estivermos 'forcando' (no caso do reset)
        if (!isManual || forcar) {
            if (online) {
                setAviso("🚀 Suporte Online: Nosso time está ativo! Seu pedido será processado em poucos minutos.");
            } else {
                setAviso("⌛ Atenção: No momento nossos atendentes estão offline. O processamento do seu pedido pode levar de 5 minutos à 2 horas ou iniciar às 08h00.");
            }
        }
    }, [isManual]);

    useEffect(() => {
        if (isLogged && !checkingAuth && socket) {

            const handleStatus = (data: { online: boolean }) => {
                definirMensagemPorStatus(data.online);
            };

            socket.on('status_admin', handleStatus);
            socket.emit('verificar_admin_online');

            return () => {
                socket.off('status_admin', handleStatus);
            };
        } else {
            console.log("⚠️ Prazos: Socket não disponível ou usuário não logado.");
        }
    }, [isLogged, checkingAuth, socket, definirMensagemPorStatus]);

    const handleEdit = () => {
        setTempAviso(aviso);
        setIsEditing(true);
    };

    const handleSave = () => {
        setAviso(tempAviso);
        setIsEditing(false);
        setIsManual(true);
    };

    const resetarParaAutomatico = () => {
        setIsManual(false);
        // Forçamos a atualização imediata ao resetar
        socket?.emit('verificar_admin_online');
    };

    return (
        <div className="w-full">
            {/* Controles do Admin */}
            {isAdmin && (
                <div className="my-4 flex justify-end gap-2">
                    {isManual && (
                        <button
                            onClick={resetarParaAutomatico}
                            className="cursor-pointer text-[10px] bg-gray-700 px-3 py-1 uppercase hover:bg-gray-600 text-white"
                        >
                            🔄 Voltar ao Automático
                        </button>
                    )}
                    <button
                        onClick={isEditing ? handleSave : handleEdit}
                        className="cursor-pointer text-[10px] bg-orange-combat px-3 py-1 uppercase hover:bg-orange-500 text-white"
                    >
                        {isEditing ? "✅ Salvar Alteração" : "✏️ Editar Mensagem"}
                    </button>
                </div>
            )}

            {/* Renderização da Mensagem (O que faltava) */}
            {aviso && (
                <div className={`w-full mb-6 p-4 border-l-4 transition-all ${isAdminOnline
                    ? "bg-green-500/10 hover:bg-green/30 border-green-500 text-green-500"
                    : "bg-orange-combat/10 hover:bg-orange-combat/30 border-orange-combat text-orange-combat"
                    }`}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-1">
                        {isAdminOnline ? "🟢 Status do Atendimento:" : "📅 Informação de Prazo:"}
                    </p>

                    {isEditing ? (
                        <textarea
                            className="w-full bg-black/40 border border-orange-combat/50 text-white p-2 text-[11px] rounded focus:outline-none focus:border-orange-combat"
                            value={tempAviso}
                            onChange={(e) => setTempAviso(e.target.value)}
                            rows={3}
                        />
                    ) : (
                        <p className="text-[11px] leading-relaxed text-white/90">{aviso}</p>
                    )}
                </div>
            )}
        </div>
    );
};