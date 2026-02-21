import { Link, Navigate, useParams } from 'react-router-dom'
import { FormCurriculo } from '../servicosForm/curriculo';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { FormIPTU } from '../servicosForm/viaIptu';
import { FormIPVA } from '../servicosForm/ipva';
import { Prazos } from '../../hooks/Prazos';

export const FormularioDinamico = () => {
    const { serviceName } = useParams();
    const { checkingAuth, isLogged, user } = useContext(AuthContext);

    if (checkingAuth) return <div className="text-white">Verificando autenticação...</div>;

    if (!isLogged) {
        return <Navigate to="/login" state={{ from: `/solicitar/${serviceName}` }} />;
    }

    const renderForm = () => {
        switch (serviceName) {
            case 'criacao-de-curriculo':
                return <FormCurriculo />;
            case 'via-iptu-valor-total':
                return <FormIPTU />
            case 'via-iptu-parcela':
                return <FormIPTU />
            case 'via-ipva-e-licenciamento':
                return <FormIPVA />
            case 'via-ipva':
                return <FormIPVA />
            case 'via-licenciamento-anual-do-veiculo':
                return <FormIPVA />
            default:
                return <p>Serviço não encontrado.</p>
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center text-white bg-linear-to-r from-[#FF3300] via-[#FF5900] to-[#803100]">
            <div className="bg-neutral-grayish border border-neutral-border-light-color p-8 flex flex-col items-center my-2.5 min-[1139px]:w-280 min-[610px]:w-139 min-[320px]:w-71">

                <div className="flex gap-3 w-full justify-end my-2">
                    <Link to={`/${user?.nick}`} className="hover:text-orange-combat transition-all">Voltar</Link>
                    <p>|</p>
                    <Link to="/logout" className="cursor-pointer hover:text-orange-combat transition-all">Sair</Link>
                </div>

                <h1 className="text-center text-orange-combat text-xl font-bold mb-6">
                    Solicitando:<br /> {serviceName?.replace(/-/g, ' ').toUpperCase()}
                </h1>

                <Prazos />

                <div className="p-4 bg-red-500/10 hover:bg-red-500/30 border-l-4 border-red-500 text-red-500 w-full transition-all">
                    <p className="text-xs font-bold uppercase tracking-wider mb-1 transition-all">⚠️ Atenção!</p>
                    <p className="text-[11px] leading-relaxed text-white/90">* Forneça todos os dados obrigatórios aqui requeridos (campos com *), ou seu serviço não será processado.</p>
                    <p className="text-[11px] leading-relaxed text-white/90">* Campos com * (asterisco) são obrigatórios!</p>
                </div>

                {renderForm()}
            </div>
        </div >
    );
}