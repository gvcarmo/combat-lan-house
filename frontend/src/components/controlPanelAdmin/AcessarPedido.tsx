import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import type { Pedido } from "./PedidosPendentes";
import { AuthContext } from "../../contexts/AuthContext";
import { VisualizarPedidoCurriculo } from "../servicosForm/curriculo";
import { VisualizarPedidoIPTU } from "../servicosForm/viaIptu";
import { VisualizarPedidoIPVA } from "../servicosForm/ipva";
import { VisualizarPedidoMEI } from "../servicosForm/viaMEI";
import { VisualizarPedidoAntCivil } from "../servicosForm/AntCivil";
import { VisualizarPedidoAntTJ } from "../servicosForm/AntTJ";
import { VisualizarPedidoAntEleitoral } from "../servicosForm/AntEleitoral";
import { VisualizarPedidoAntTRF1 } from "../servicosForm/AntTRF";
import { VisualizarPedidoAntSTM } from "../servicosForm/AntSTM";
import { VisualizarPedidoAntTJM } from "../servicosForm/AntTJM";
import { VisualizarPedidoAntPF } from "../servicosForm/AntPF";
import { VisualizarPedidoContratoRes } from "../servicosForm/ContratoRes";

export const AcessarPedido = () => {
    const [dadosPedido, setDadosPedido] = useState<Pedido | null>(null);
    const { id } = useParams();

    const { user, isAdmin, isLogged } = useContext(AuthContext);

    const navigate = useNavigate();

    useEffect(() => {
        api.get(`/pedido/${id}`).then(res => setDadosPedido(res.data))
    }, [])

    const renderForm = () => {
        switch (dadosPedido?.jobId) {
            case 17:
                return <VisualizarPedidoCurriculo />;
            case 18:
                return <VisualizarPedidoIPTU />
            case 19:
                return <VisualizarPedidoIPTU />
            case 20:
                return <VisualizarPedidoIPVA />
            case 21:
                return <VisualizarPedidoIPVA />
            case 22:
                return <VisualizarPedidoIPVA />
            case 23:
                return <VisualizarPedidoMEI />
            case 24:
                return <VisualizarPedidoAntCivil />
            case 25:
                return <VisualizarPedidoAntTJ />
            case 26:
                return <VisualizarPedidoAntEleitoral />
            case 27:
                return <VisualizarPedidoAntEleitoral />
            case 28:
                return <VisualizarPedidoAntTRF1 />
            case 29:
                return <VisualizarPedidoAntSTM />
            case 30:
                return <VisualizarPedidoAntTJM />
            case 31:
                return <VisualizarPedidoAntPF />
            case 32:
                return <VisualizarPedidoContratoRes />
            default:
                return <p>Serviço não encontrado.</p>
        }
    };

    if (!isAdmin && user || !isLogged) {
        navigate(`/${user?.nick}`);
        return;
    }

    if (!dadosPedido) {
        return <div className="min-h-screen flex justify-center items-center bg-black text-white">Carregando dados do pedido...</div>;
    }

    return (
        <div>
            {isAdmin && (
                <div>
                    {renderForm()}
                </div>
            )}
        </div>

    )

}