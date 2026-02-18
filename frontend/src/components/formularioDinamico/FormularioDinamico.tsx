import { Navigate, useParams } from 'react-router-dom'
import { FormCurriculo } from '../servicosForm/curriculo';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { FormIPTU } from '../servicosForm/viaIptu';

export const FormularioDinamico = () => {
    const { serviceName } = useParams();
    const { checkingAuth, isLogged } = useContext(AuthContext);
    const [aviso, setAviso] = useState("");

    const exibirAvisoPrazo = () => {
        const agora = new Date();
        const diaSemana = agora.getDay();
        const hora = agora.getHours();

        let mensagem = "";

        if (diaSemana === 0) {
            mensagem = "Atenção: Solicitações de serviços feitas no Domingo só serão processadas na Segunda-Feira à partir das 08h00.";
        }
        else if (hora >= 18 || hora < 8) {
            mensagem = "Atenção: O seu pedido está sendo feito fora do horário comercial da nossa loja online, o processamento só irá ser iniciado à partir das 08h00."
        }
        else {
            mensagem = "Atenção: Após o recebimento do seu pedido, o prazo de entrega é de 5 minutos à 2 horas! Por favor aguarde."
        }
        setAviso(mensagem);
    }

    useEffect(() => {
        if (isLogged && !checkingAuth) {
            exibirAvisoPrazo();
        }
    }, [isLogged, checkingAuth]);

    if (checkingAuth) return <div className="text-white">Verificando autenticação...</div>;

    if (!isLogged) {
        return <Navigate to="/login" state={{ from: `/solicitar/${serviceName}` }} />;
    }

    const renderForm = () => {
        switch (serviceName) {
            case 'criacao-de-curriculo':
                return <FormCurriculo />;
            case 'via-iptu':
                return <FormIPTU />
            default:
                return <p>Serviço não encontrado.</p>
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center text-white bg-linear-to-r from-[#FF3300] via-[#FF5900] to-[#803100]">
            <div className="bg-neutral-grayish border border-neutral-border-light-color p-8 flex flex-col items-center my-2.5 min-[1139px]:w-280 min-[610px]:w-139 min-[320px]:w-71">
                <h1 className="text-center text-orange-combat text-xl font-bold mb-4">
                    Solicitando:<br /> {serviceName?.replace(/-/g, ' ').toUpperCase()}
                </h1>

                {aviso && (
                    <div className="mb-6 p-4 bg-orange-combat/10 border-l-4 border-orange-combat text-orange-combat w-full">
                        <p className="text-xs font-bold uppercase tracking-wider mb-1">📅 Informação de Prazo:</p>
                        <p className="text-[11px] leading-relaxed text-white/90">{aviso}</p>
                    </div>
                )}

                {renderForm()}
            </div>
        </div >
    );
}