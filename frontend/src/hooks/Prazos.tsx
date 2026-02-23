import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";

export const Prazos = () => {
    const [aviso, setAviso] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [tempAviso, setTempAviso] = useState("");

    const { checkingAuth, isLogged, isAdmin } = useContext(AuthContext);

    const exibirAvisoPrazo = () => {
        const agora = new Date();
        const diaSemana = agora.getDay();
        const hora = agora.getHours();

        let mensagem = "";

        if (diaSemana === 0) {
            mensagem = "Atenção: Após o pagamento do seu pedido, o prazo de entrega é de 5 minutos à 2 horas! Por favor aguarde!";
        }
        else if (hora >= 18 || hora < 8) {
            mensagem = "Atenção: O seu pedido está sendo feito fora do horário comercial da nossa loja online, o processamento só irá ser iniciado à partir das 08h00."
        }
        else {
            mensagem = "Atenção: Após o pagamento do seu pedido, o prazo de entrega é de 5 minutos à 2 horas! Por favor aguarde."
        }
        setAviso(mensagem);
    }

    useEffect(() => {
        if (isLogged && !checkingAuth) {
            exibirAvisoPrazo();
        }
    }, [isLogged, checkingAuth]);

    const handleEdit = () => {
        setTempAviso(aviso);
        setIsEditing(true);
    };

    const handleSave = () => {
        setAviso(tempAviso);
        setIsEditing(false);
    };

    return (
        <div className="w-full">
            {/* Área do Admin para habilitar edição */}
            {isAdmin && (
                <div className="my-4 flex justify-end">
                    <button
                        onClick={isEditing ? handleSave : handleEdit}
                        className="cursor-pointer text-[10px] bg-orange-combat px-3 py-1 uppercase hover:bg-orange-500 transition-colors"
                    >
                        {isEditing ? "✅ Salvar Alteração" : "✏️ Editar Mensagem"}
                    </button>
                </div>
            )}

            {aviso && (
                <div className="w-full mb-6 p-4 bg-orange-combat/10 hover:bg-orange-combat/30 border-l-4 border-orange-combat text-orange-combat transition-all">
                    <p className="text-xs font-bold uppercase tracking-wider mb-1">📅 Informação de Prazo:</p>

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