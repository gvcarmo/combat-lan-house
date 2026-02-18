import { useContext, useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

interface Pedido {
    id: any;
    status: "aguardando pagamento" | "pendente" | "recebido" | "finalizado";
    criadoEm: string;
    atualizadoEm: string;
    job: { nome: string };
}

interface PixData {
    qr_code: string;
    qr_code_base64: string;
}

export const MeusPedidos = () => {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);

    const [pixDados, setPixDados] = useState<PixData | null>(null);
    const [carregando, setCarregando] = useState(false);
    const [copiado, setCopiado] = useState(false);
    const [modalAberto, setModalAberto] = useState(false);
    const [pedidoAtivoId, setPedidoAtivoId] = useState<number | null>(null);
    const [mostrarLegenda, setMostrarLegenda] = useState(false);
    const [_pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null);

    const { setGlobalLoading, isLogged, user } = useContext(AuthContext);

    const navigate = useNavigate();

    useEffect(() => {
        let intervalo: any;

        if (modalAberto && pedidoAtivoId) {
            intervalo = setInterval(async () => {
                try {
                    const response = await api.get(`/pedido/status/${pedidoAtivoId}`)

                    if (response.data.status === 'pendente') {
                        alert("Pagamento confirmado com sucesso! Seu pedido está sendo processado.");
                        setModalAberto(false);
                        setPedidoAtivoId(null);
                        window.location.reload();
                    }
                } catch (err) {
                    console.error("Erro ao verificar status");
                }
            }, 3000);
        }
        return () => clearInterval(intervalo);
    }, [modalAberto, pedidoAtivoId]);

    const handleGerarPix = async (pedidoId: number) => {
        setCarregando(true);
        try {
            const response = await api.post('/gerar-pix', { pedidoId });
            setPixDados(response.data);
            setPedidoAtivoId(pedidoId);
            setModalAberto(true);
        } catch (error) {
            alert("Erro ao gerar PIX. Verifique seu backend.");
        } finally {
            setCarregando(false);
        }
    };

    const copiarCodigo = () => {
        if (pixDados) {
            navigator.clipboard.writeText(pixDados.qr_code);
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2000);
        }
    };

    useEffect(() => {
        if (isLogged && user) {
            api.get('/meus-pedidos')
                .then(res => setPedidos(res.data))
                .catch(err => console.error("Erro ao carregar pedidos", err));
        }
    }, [user, isLogged]);

    if (!isLogged) {
        return (
            <div className="flex flex-col items-center">
                <p>Você precisa estar logado para ver seus pedidos.</p>
                <button onClick={() => navigate('/login')}>Fazer Login</button>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'aguardando pagamento': return 'bg-blue-100 text-blue-800';
            case 'pendente': return 'bg-yellow-100 text-yellow-800';
            case 'finalizado': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleEditOrder = (pedido: Pedido) => {

        setPedidoSelecionado(pedido);

        navigate(`/formulario/${pedido.id}/view`);
    }

    const fetchPedidos = async () => {
        const res = await api.get('/meus-pedidos');
        setPedidos(res.data);
    }

    const handleDeleteOrder = async (id: Pedido) => {
        if (window.confirm(`Tem certeza que deseja excluir o pedido?`)) {

            setGlobalLoading(true);
            try {
                await api.delete(`/pedidos/${id}`);
                alert("Pedido excluido com sucesso!");
                fetchPedidos();
            } catch (err) {
                alert("Erro ao excluir pedido.");
            } finally {
                setGlobalLoading(false);
            }
        }
    }

    const handleDownload = async (pedidoId: number) => {
        setGlobalLoading(true);
        try {
            const token = localStorage.getItem('@CombatLan:token');

            const response = await api.get(`/pedido/${pedidoId}/download`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const { url } = response.data;

            if (url) {
                const link = document.createElement('a');
                link.href = url;

                link.setAttribute('download', '');
                document.body.appendChild(link);
                link.click();

                setTimeout(() => {
                    document.body.removeChild(link);
                }, 100);
            } else {
                alert("URL de download não encontrada.");
            }
        } catch (error) {
            console.error("Erro no download:", error);
            alert("Erro ao iniciar o download do arquivo.");
        } finally {
            setGlobalLoading(false);
        }
    }

    const pedidosEmAndamento = pedidos.filter(p =>
        p.status === 'aguardando pagamento' || p.status === 'pendente'
    )

    const pedidosConcluidos = pedidos.filter(p =>
        p.status === 'finalizado'
    )

    const backCampoClass = `py-2 pl-4 flex flex-col md:col-span-2`
    const titleClass = `text-xs text-orange-combat uppercase font-bold mb-1`
    const campoClass = `p-1 mr-2 text-sm transition-colors resize-none`

    const verificarExpiracao = (dataAtualização: any) => {

        if (!dataAtualização) return false;

        const dataEntrega = new Date(dataAtualização);

        const dataExpiração = new Date(dataEntrega);
        dataExpiração.setDate(dataExpiração.getDate() + 90);

        const hoje = new Date();
        return hoje > dataExpiração;
    }

    const renderCardPedido = (pedido: Pedido, isConcluido: boolean = false) => {
        // Cálculo de 3 meses a frente (Data de Entrega + 90 dias)
        const dataEntrega = new Date(pedido.atualizadoEm); // No seu caso, ideal seria ter p.dataFinalizacao
        const dataExpiracao = new Date(dataEntrega);
        dataExpiracao.setMonth(dataExpiracao.getMonth() + 3);

        return (
            <div key={pedido.id} className={`border-l-2 border-orange-combat bg-neutral-grayish-dark shadow-sm flex justify-between items-center max-[610px]:flex-col max-[610px]:items-stretch`}>
                <div className={`${backCampoClass}`}>
                    <h3 className={`${titleClass}`}>{pedido.job.nome}</h3>
                    <p className={`${campoClass}`}>
                        <span className="text-orange-combat">Pedido em:</span> {new Date(pedido.criadoEm).toLocaleDateString()}
                    </p>

                    {isConcluido && (
                        <p className="text-[10px] text-orange-pailed font-medium">
                            Disponível para download até: {dataExpiracao.toLocaleDateString()}
                        </p>
                    )}

                    <div>
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase ${getStatusColor(pedido.status)}`}>
                            {pedido.status}
                        </span>
                    </div>

                </div>



                <div className="flex flex-col items-end max-[610px]:items-center gap-2 p-2">
                    {/* Botões de Ação (Mesma lógica que você já tinha) */}
                    {pedido.status === 'aguardando pagamento' && (
                        <>
                            <button onClick={() => handleEditOrder(pedido)} className="cursor-pointer text-xs bg-orange-combat text-white px-3 py-1 w-fit hover:bg-gray-700 transition-colors">
                                Editar
                            </button>
                            <button onClick={() => handleDeleteOrder(pedido.id)} className="cursor-pointer text-xs bg-orange-combat text-white px-3 py-1 w-fit hover:bg-gray-700 transition-colors">
                                Excluir
                            </button>
                            <button onClick={() => handleGerarPix(pedido.id)} className="cursor-pointer text-xs bg-orange-combat text-white px-3 py-1 w-fit hover:bg-gray-700 transition-colors">
                                {carregando ? 'Gerando...' : 'Pagar com PIX'}
                            </button>
                        </>
                    )}

                    {pedido.status === 'finalizado' && (
                        <div className="p-2 bg-neutral-dark/50 rounded-sm">

                            {/* 2. Verificamos se os 90 dias já passaram (usando a função de expiração) */}
                            {verificarExpiracao(pedido.atualizadoEm) ? (

                                // CASO: EXPIROU
                                <div className="flex flex-col items-center gap-2 p-2 border border-red-900/30 bg-red-900/10">
                                    <span className="text-red-500 text-xs font-bold uppercase tracking-widest">
                                        ⚠️ Acesso Expirado
                                    </span>
                                    <p className="text-[9px] text-gray-500 text-center leading-relaxed">
                                        OS ARQUIVOS DESTE PEDIDO FICARAM DISPONÍVEIS POR 90 DIAS APÓS A ENTREGA.<br />
                                        PARA RECUPERÁ-LOS, ENTRE EM CONTATO COM O SUPORTE.
                                    </p>
                                </div>

                            ) : (

                                // CASO: DENTRO DO PRAZO
                                <div className="flex gap-2">
                                    <div className="flex flex-col gap-2 px-2 py-1 border border-green-900/30 bg-green-900/10">
                                        <div className="flex items-center gap-2 border-b border-green-900/30">
                                            <span className="text-orange-combat">📦</span>
                                            <h4 className="text-orange-combat font-bold text-[11px] uppercase tracking-wider">
                                                Entrega Disponível
                                            </h4>
                                        </div>
                                        <div className="flex flex-col gap-1 justify-between items-center px-1">
                                            <span className="text-[9px] text-gray-500 uppercase tracking-tighter">
                                                O link será removido automaticamente em 90 dias.
                                            </span>
                                            <span className="text-[9px] text-gray-400 font-bold bg-white/5 px-2 py-0.5">
                                                EXPIRA EM: {new Date(new Date(pedido.atualizadoEm).setDate(new Date(pedido.atualizadoEm).getDate() + 90)).toLocaleDateString()}
                                            </span>
                                        </div>

                                    </div>
                                    <div className="mt-2 flex items-center justify-center">
                                        <button onClick={() => handleDownload(pedido.id)} className="cursor-pointer text-xs bg-orange-combat text-white px-3 py-1 w-fit hover:bg-gray-700 transition-colors">
                                            Baixar Arquivo
                                        </button>
                                    </div>

                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="container mx-auto">
            <div className="my-5 flex flex-col items-center justify-center">
                <h3 className="mb-2.5 text-orange-combat font-semibold text-[18px] ">Meus pedidos</h3>
            </div>
            <div className="grid gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex justify-end">
                        <button onClick={() => setMostrarLegenda(!mostrarLegenda)} className="cursor-pointer px-4 py-1 w-fit bg-orange-combat hover:bg-gray-700 transition-all font-semibold">
                            {mostrarLegenda ? "Legenda ▲" : "Legenda ▼"}
                        </button>
                    </div>

                    <div className={`legenda ${mostrarLegenda ? 'active' : ''} border border-orange-combat shadow-sm flex flex-col gap-2  max-[610px]:gap-3`}>
                        <p>Em pedidos com status:</p>
                        <div className="flex gap-3 items-center max-[610px]:flex-col">
                            <p className={`h-fit px-2 py-1 text-xs max-[610px]:text-[11.5px] font-bold uppercase bg-blue-100 text-blue-800`}>
                                aguardando pagamento
                            </p>
                            <div className="text-xs">
                                <p>* Você pode visualizar o pedido e edita-lo;</p>
                                <p>* Pode deletar o pedido.</p>
                                <p>* Realize o pagamento para prosseguir com o atendimento.</p>
                            </div>
                        </div>

                        <div className="flex gap-3 items-center max-[610px]:flex-col">
                            <p className={`h-fit px-2 py-1 text-xs font-bold uppercase bg-yellow-100 text-yellow-800`}>
                                pendente
                            </p>
                            <div className="text-xs">
                                <p>* São pedidos que estão pagos;</p>
                                <p>* Você não pode mais edita-lo, o serviço está em produção, por favor aguarde.</p>
                            </div>
                        </div>

                        <div className="flex gap-3 items-center max-[610px]:flex-col">
                            <p className={`h-fit px-2 py-1 text-xs font-bold uppercase bg-green-100 text-green-800`}>
                                finalizado
                            </p>
                            <div className="text-xs">
                                <p>* Pedidos que já foram enviados para o cliente;</p>
                                <p>* O arquivo fica disponível para download por 90 dias.</p>
                            </div>
                        </div>
                    </div>

                </div>

                {pedidos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-gray-700">
                        <p className="text-gray-500 italic">Você ainda não realizou nenhum pedido.</p>
                    </div>
                ) : (
                    <div className="shadow-sm">

                        <div className="grid gap-8 mt-2 max-[610px]:mt-0">

                            {/* SEÇÃO: EM ANDAMENTO */}
                            <section>
                                <h2 className="flex items-center gap-2 mb-2.5 text-orange-combat font-semibold text-[18px]">
                                    <p className="w-2 h-2 max-[610px]:w-2.5 bg-blue-500 rounded-full animate-pulse"></p>
                                    Pedidos em andamento:
                                </h2>
                                <div className="grid gap-4">
                                    {pedidosEmAndamento.length === 0 ? (
                                        <p className="text-gray-500 italic text-sm">Nenhum pedido em andamento.</p>
                                    ) : (
                                        pedidosEmAndamento.map(pedido => renderCardPedido(pedido))
                                    )}
                                </div>
                            </section>

                            {/* SEÇÃO: CONCLUÍDOS */}
                            <section>
                                <h2 className="flex items-center gap-2 mb-2.5 text-orange-combat font-semibold text-[18px]">
                                    <p className="w-2 h-2 max-[610px]:w-2.5 bg-green-600 rounded-full"></p>
                                    Pedidos concluídos:
                                </h2>
                                <div className="grid gap-4">
                                    {pedidosConcluidos.length === 0 ? (
                                        <p className="text-gray-500 italic text-sm">Você ainda não possui pedidos concluídos.</p>
                                    ) : (
                                        pedidosConcluidos.map(pedido => renderCardPedido(pedido, true))
                                    )}
                                </div>
                            </section>

                        </div>

                        <div className="flex flex-col gap-2">
                            {pixDados && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                                    <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl text-center relative">

                                        <button
                                            onClick={() => setPixDados(null)}
                                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                                            x
                                        </button>

                                        <h2 className="text-xl font-bold text-gray-800 mb-4">Pagamento via PIX</h2>

                                        <div className="bg-gray-100 p-4 rounded-lg mb-4">
                                            <img src={`data:image/png;base64,${pixDados.qr_code_base64}`} alt="QR Code"
                                                className="w-48 h-48 mx-auto shadow-sm" />
                                        </div>

                                        <p className="text-sm text-gray-600 mb-4">Aponte a câmera do seu banco para o código acima ou copie o código abaixo:</p>

                                        <div className="relative">
                                            <textarea readOnly
                                                value={pixDados.qr_code}
                                                className="w-full text-[10px] p-3 bg-gray-50 border rounded-lg h-20 mb-4 focus:outline-none" />
                                            <button
                                                onClick={copiarCodigo}
                                                className={`w-full py-2 rounded-lg font-bold transition-all ${copiado ? 'bg-gray-700 text-white' : 'bg-orange-combat text-white'
                                                    }`}
                                            >
                                                {copiado ? '✓ Código Copiado!' : 'Copiar Código PIX'}
                                            </button>
                                        </div>

                                        <p className="mt-4 text-[10px] text-gray-400 uppercase tracking-widest">
                                            O status será atualizado automaticamente após o pagamento
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

