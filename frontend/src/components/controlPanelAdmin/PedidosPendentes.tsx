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
    status: "aguardando pagamento" | "pendente" | "recebido" | "finalizado";
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

    const { setGlobalLoading, isLogged, isAdmin, checkingAuth } = useContext(AuthContext);
    const navigate = useNavigate();

    const backCampoClass = `py-2 pl-4 flex flex-col md:col-span-2`
    const titleClass = `text-xs text-orange-combat uppercase font-bold mb-1`
    const campoClass = `p-1 mr-2 text-sm transition-colors resize-none`

    const socket = io('http://localhost:3000');

    useEffect(() => {
        socket.on('novo_pedido', (pedidoRecemCriado: Pedido) => {
            console.log("Novo pedido recebido via Socket!", pedidoRecemCriado);

            setPedidos((prevPedidos) => [pedidoRecemCriado, ...prevPedidos]);

            // DICA: Tocar um som de alerta (opcional)
            audio.play().catch(e => {
                console.warn("O áudio foi bloqueado pelo navegador. Clique em qualquer lugar da página para habilitar o som.");
            });
        });

        return () => {
            socket.off('novo_pedido');
        };
    }, []);

    useEffect(() => {
        if (isLogged && isAdmin) {
            api.get('/admin/pedidos')
                .then(res => setPedidos(res.data))
                .catch(err => {
                    if (err.response?.status === 403) {
                        console.log("Ainda sem permissão de admin no servidor.");
                    }
                });
        }
    }, [isLogged, isAdmin]);

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

    return (
        <div>
            <div className="my-5 flex flex-col items-center justify-center">
                <h3 className="mb-2.5 text-orange-combat font-semibold text-[18px] ">Pedidos pendentes</h3>
            </div>
            {pedidos.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-gray-700">
                    <p className="text-gray-500 italic">Não há nenhum pedido pendente.</p>
                </div>
            ) : (
                <div>
                    <h3 className="mb-2.5 text-orange-combat font-semibold text-[18px]">Pedidos em andamento:</h3>

                    {pedidos.map((pedido) =>
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


                                <button className="cursor-pointer text-xs bg-orange-combat text-white px-3 py-1 w-fit hover:bg-gray-700 transition-colors">
                                    Alterar Status
                                </button>
                            </div>

                        </div>
                    )}
                </div>
            )
            }
        </div >
    )
}
