import { useContext, useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { io } from 'socket.io-client';

export interface Pedido {
    id: number;
    jobId: number;
    arquivosEnviados: string[];
    arquivosFinal: string[];
    status: 'aguardando pagamento' | 'pendente' | 'recebido' | 'finalizado';
    criadoEm: string;
    usuario: Usuario;
    job: Job;
}

interface Usuario {
    nome_completo: string;
}

interface Job {
    nome: string;
}

const audio = new Audio('./alerta.mp3');

export const PedidosPendentes = () => {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [uploadingId, setUploadingId] = useState<number | null>(null);

    const { setGlobalLoading } = useContext(AuthContext);
    const navigate = useNavigate();

    const backCampoClass = `py-2 pl-4 flex flex-col md:col-span-2`
    const titleClass = `text-xs text-orange-combat uppercase font-bold mb-1`
    const campoClass = `p-1 mr-2 text-sm transition-colors resize-none`

    const carregarHistorico = async () => {
        try {
            const res = await api.get('/admin/pedidos');
            setPedidos(res.data);
        } catch (err: any) {
            console.error("Erro ao buscar pedidos:", err);
            if (err.response?.status === 403) {
                console.error("Acesso negado: O usuário não é admin no backend.");
            }
        }
    }

    useEffect(() => {
        carregarHistorico();
    }, []);

    useEffect(() => {
        const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
            transports: ['websocket', 'polling'],
            withCredentials: true
        });

        socket.on('novo_pedido', (pedidoRecemCriado: Pedido) => {
            setPedidos((prev) => {
                const existe = prev.find(p => p.id === pedidoRecemCriado.id);
                if (existe) return prev;
                return [pedidoRecemCriado, ...prev];
            });

            audio.play().catch(() => { });
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleUploadFile = async (pedidoId: number, file: File) => {
        const formData = new FormData();
        formData.append('arquivosFinal', file);

        setGlobalLoading(true);

        try {
            await api.post(`/pedido/${pedidoId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Arquivo enviado com sucesso!');

            const res = await api.get('/pedidos');
            setPedidos(res.data);
        } catch (error) {
            console.error("Erro no upload", error);
            alert("Falha ao enviar arquivo.");
        } finally {
            setGlobalLoading(false);
            setUploadingId(null);
        }
    }

    const handleStatusChange = async (pedidoId: number, novoStatus: string) => {
        if (!confirm(`Deseja alterar o status para ${novoStatus}?`)) return;

        setGlobalLoading(true);
        try {
            await api.patch(`/admin/pedido/${pedidoId}/status`, { status: novoStatus });
            alert("Status atualizado!");
            carregarHistorico();
        } catch (error) {
            console.error(error);
            alert("Erro ao alterar status.");
        } finally {
            setGlobalLoading(false);
        }
    };

    const pedidosFiltrados = pedidos.filter(p => p.status === 'pendente');

    return (
        <div>
            <div className="my-5 flex flex-col items-center justify-center">
                <h3 className="mb-2.5 text-orange-combat font-semibold text-[18px] ">Pedidos pendentes ({pedidosFiltrados.length})</h3>
            </div>
            {pedidosFiltrados.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-gray-700">
                    <p className="text-gray-500 italic">Não há nenhum pedido pendente.</p>
                </div>
            ) : (
                <div>
                    <h3 className="mb-2.5 text-orange-combat font-semibold text-[18px]">Pedidos em andamento:</h3>

                    {pedidosFiltrados.map((pedido) =>
                        <div key={pedido.id} className="mb-4 flex justify-between pr-4 gap-3 border-l-2 border-orange-combat bg-neutral-grayish-dark max-[610px]:flex-col">
                            <div className={`${backCampoClass}`}>
                                <label className={`${titleClass}`}>Criado em:</label>
                                <p className={`${campoClass}`}><span className="text-orange-combat">Data:</span> {new Date(pedido.criadoEm).toLocaleDateString()}</p>
                                <p className={`${campoClass}`}><span className="text-orange-combat">Horário:</span> {new Date(pedido.criadoEm).toLocaleTimeString()}</p>
                            </div>

                            <div className={`${backCampoClass}`}>
                                <label className={`${titleClass}`}>Nome do cliente:</label>
                                <p className={`${campoClass}`}>{pedido.usuario.nome_completo}</p>
                            </div>

                            <div className={`${backCampoClass}`}>
                                <label className={`${titleClass}`}>Nome do Serviço:</label>
                                <p className={`${campoClass}`}>{pedido.job.nome}</p>
                            </div>

                            <div className={`${backCampoClass} items-end max-[610px]:items-center gap-2`}>
                                <button onClick={() => { navigate(`/pedido/${pedido.id}`); }} className="cursor-pointer text-xs bg-orange-combat text-white px-3 py-1 w-fit hover:bg-gray-700 transition-colors">
                                    Acessar
                                </button>

                                <div className="flex flex-col items-end">
                                    <button onClick={() => setUploadingId(uploadingId === pedido.id ? null : pedido.id)} className="cursor-pointer text-xs bg-orange-combat px-3 py-1 w-fit hover:bg-gray-700 transition-colors">
                                        {uploadingId === pedido.id ? "Cancelar" : "Carregar Arquivos"}
                                    </button>

                                    {uploadingId === pedido.id && (
                                        <input
                                            type="file"
                                            className="block mt-2 text-[10px]"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleUploadFile(pedido.id, file);
                                            }}
                                        />
                                    )}
                                </div>


                                <select
                                    className="cursor-pointer text-xs bg-gray-800 text-white px-2 py-1 border border-orange-combat outline-none"
                                    value={pedido.status}
                                    onChange={(e) => handleStatusChange(pedido.id, e.target.value)}
                                >
                                    <option value="pendente">Pendente</option>
                                    <option value="aguardando pagamento">Aguardando Pagamento</option>
                                    <option value="finalizado">Finalizado</option>
                                </select>
                            </div>

                        </div>
                    )}
                </div>
            )
            }
        </div >
    )
}
