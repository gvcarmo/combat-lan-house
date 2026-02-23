import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";

export const Prazos = () => {
    const [aviso, setAviso] = useState("");
    const { checkingAuth, isLogged } = useContext(AuthContext);

    const exibirAvisoPrazo = () => {
        const agora = new Date();
        const diaSemana = agora.getDay();
        const hora = agora.getHours();

        let mensagem = "";

        if (diaSemana === 0) {
            // mensagem = "Atenção: Solicitações de serviços feitas no Domingo só serão processadas na Segunda-Feira à partir das 08h00.";
            mensagem = "Atenção: Após o pagamento do seu pedido, o prazo de entrega é de 5 minutos à 2 horas! Por favor aguarde!";
        }
        // else if (hora >= 18 || hora < 8) {
        //     mensagem = "Atenção: O seu pedido está sendo feito fora do horário comercial da nossa loja online, o processamento só irá ser iniciado à partir das 08h00."
        // }
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

    return (
        <div className="w-full">
            {aviso && (
                <div className="w-full mb-6 p-4 bg-orange-combat/10 hover:bg-orange-combat/30 border-l-4 border-orange-combat text-orange-combat  transition-all">
                    <p className="text-xs font-bold uppercase tracking-wider mb-1">📅 Informação de Prazo:</p>
                    <p className="text-[11px] leading-relaxed text-white/90">{aviso}</p>
                </div>
            )}
        </div>

    )
}