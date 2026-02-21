import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import type { Pedido } from "./PedidosPendentes";
import { AuthContext } from "../../contexts/AuthContext";
import { VisualizarPedidoCurriculo } from "../servicosForm/curriculo";
import { VisualizarPedidoIPTU } from "../servicosForm/viaIptu";
import { VisualizarPedidoIPVA } from "../servicosForm/ipva";

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

    console.log(dadosPedido)

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