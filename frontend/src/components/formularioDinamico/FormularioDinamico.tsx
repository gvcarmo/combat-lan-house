import { Link, Navigate, useParams } from 'react-router-dom'
import { FormCurriculo, VisualizarPedidoCurriculo } from '../servicosForm/curriculo';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { FormIPTU, VisualizarPedidoIPTU } from '../servicosForm/viaIptu';
import { FormIPVA, VisualizarPedidoIPVA } from '../servicosForm/ipva';
import { Prazos } from '../../hooks/Prazos';
import { FormMEI, VisualizarPedidoMEI } from '../servicosForm/viaMEI';
import { FormAntCivil, VisualizarPedidoAntCivil } from '../servicosForm/AntCivil';
import { FormAntTJ, VisualizarPedidoAntTJ } from '../servicosForm/AntTJ';
import { FormAntEleitoral, VisualizarPedidoAntEleitoral } from '../servicosForm/AntEleitoral';
import { FormAntTRF1, VisualizarPedidoAntTRF1 } from '../servicosForm/AntTRF';
import { FormAntSTM, VisualizarPedidoAntSTM } from '../servicosForm/AntSTM';
import { FormAntTJM, VisualizarPedidoAntTJM } from '../servicosForm/AntTJM';
import { FormAntPF, VisualizarPedidoAntPF } from '../servicosForm/AntPF';
import { FormContrato, VisualizarPedidoContratoRes } from '../servicosForm/ContratoRes';
import { FormCriarArte, VisualizarPedidoCriarArteSimples } from '../servicosForm/CriarArte';
import api from '../../services/api';
import { SitCadCPF } from '../servicosForm/SitCadCPF';

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
            case 'via-mei':
                return <FormMEI />
            case 'antecedentes-criminais-policia-civil':
                return <FormAntCivil />
            case 'certidao-judicial-tribunal-de-justica-mg':
                return <FormAntTJ />
            case 'certidao-de-quitacao-eleitoral':
                return <FormAntEleitoral />
            case 'certidao-de-crimes-eleitorais':
                return <FormAntEleitoral />
            case 'certidao-judicial-trf1':
                return <FormAntTRF1 />
            case 'certidao-negativa-militar-stm':
                return <FormAntSTM />
            case 'certidao-negativa-militar-tjmmg':
                return <FormAntTJM />
            case 'antecedentes-criminais-da-policia-federal':
                return <FormAntPF />
            case 'contrato-de-aluguel-residencial':
                return <FormContrato />
            case 'criacao-de-arte-simples':
                return <FormCriarArte />
            case 'criacao-de-arte-intermediaria':
                return <FormCriarArte />
            case 'criacao-de-arte-avancada':
                return <FormCriarArte />
            case 'comprovante-de-situacao-cadastral-no-cpf':
                return <SitCadCPF />
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

export const VisualizarPedidoDinamico = () => {
    const [pedido, setPedido] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();

    useEffect(() => {
        api.get(`/pedido/${id}`).then((res: any) => {
            const data = Array.isArray(res.data) ? res.data[0] : res.data;
            setPedido(data);
            setLoading(false);
        });
    }, [id]);

    if (loading) return <p>Carregando...</p>;
    if (!pedido) return <p>Pedido não encontrado.</p>;

    // O segredo está aqui: decidimos o componente com base no SLUG do job que vem do banco
    switch (pedido.job?.slug) {
            case 'criacao-de-curriculo':
                return <VisualizarPedidoCurriculo />;
            case 'via-iptu-valor-total':
                return <VisualizarPedidoIPTU />
            case 'via-iptu-parcela':
                return <VisualizarPedidoIPTU />
            case 'via-ipva-e-licenciamento':
                return <VisualizarPedidoIPVA />
            case 'via-ipva':
                return <VisualizarPedidoIPVA />
            case 'via-licenciamento-anual-do-veiculo':
                return <VisualizarPedidoIPVA />
            case 'via-mei':
                return <VisualizarPedidoMEI />
            case 'antecedentes-criminais-policia-civil':
                return <VisualizarPedidoAntCivil />
            case 'certidao-judicial-tribunal-de-justica-mg':
                return <VisualizarPedidoAntTJ />
            case 'certidao-de-quitacao-eleitoral':
                return <VisualizarPedidoAntEleitoral />
            case 'certidao-de-crimes-eleitorais':
                return <VisualizarPedidoAntEleitoral />
            case 'certidao-judicial-trf1':
                return <VisualizarPedidoAntTRF1 />
            case 'certidao-negativa-militar-stm':
                return <VisualizarPedidoAntSTM />
            case 'certidao-negativa-militar-tjmmg':
                return <VisualizarPedidoAntTJM />
            case 'antecedentes-criminais-da-policia-federal':
                return <VisualizarPedidoAntPF />
            case 'contrato-de-aluguel-residencial':
                return <VisualizarPedidoContratoRes />
            case 'criacao-de-arte-simples':
                return <VisualizarPedidoCriarArteSimples />
            case 'criacao-de-arte-intermediaria':
                return <VisualizarPedidoCriarArteSimples />
            case 'criacao-de-arte-avancada':
                return <VisualizarPedidoCriarArteSimples />
        default:
            return <VisualizarPedidoCriarArteSimples />; 
    }
};