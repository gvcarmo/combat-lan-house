import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

interface NovaArteState {
    infos_gerais: string,
    enviarArquivo: File[];
}

export const FormCriarArte = () => {
    const [isSending, setIsSending] = useState(false);

    const { serviceName } = useParams();

    const { setGlobalLoading, user } = useContext(AuthContext);

    const navigate = useNavigate();

    const [novaArte, setNovaArte] = useState<NovaArteState>({
        infos_gerais: '',
        enviarArquivo: []
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();

        formData.append('jobSlug', serviceName || "");

        const dadosParaEnvio = {
            infos_gerais: novaArte.infos_gerais,
            // adicione aqui outros campos se houver
        };
        formData.append('dadosForm', JSON.stringify(dadosParaEnvio));

        novaArte.enviarArquivo.forEach((file) => {
            formData.append('arquivosEnviados', file);
        });

        setIsSending(true);
        setGlobalLoading(true);
        try {
            const response = await api.post('/pedidos', formData);

            const novoPedidoId = response.data.id;

            alert(`Pedido realizado com sucesso! Realize o pagamento.`);

            navigate(`/${user?.nick}?aba=meus_pedidos&pagar=${novoPedidoId}`);

        } catch (error) {
            alert("Erro ao enviar, verifique os dados.")

        } finally {
            setGlobalLoading(false);
            setIsSending(true);
        }
    }

    const backCampoClass = `border-l-2 border-orange-combat bg-neutral-dark-grayish py-2 pl-4 flex flex-col gap-1 md:col-span-2 mb-6`
    const titleClass = `text-xs text-orange-combat uppercase font-bold mb-1`
    const campoClass = `p-1 mr-2 text-sm bg-neutral-grayish border border-gray-700 focus:border-orange-combat outline-none transition-colors resize-none`

    return (
        <div className="w-full">
            <form onSubmit={handleSubmit} id="submit" className="flex flex-col mt-5 gap-2">

                <div className="flex flex-col p-5 max-[610px]:p-0 gap-2">
                    <h5 className="text-[18px] font-semibold text-orange-combat mb-2.5">Dados Necessários:</h5>

                    <p className="text-xs mb-4">Atenção! Caso você não tenha certeza de alguma informação, é recomendado que abra um Ticket primeiro para retirar todas as dúvidas. <a className="text-blue-500 hover:text-blue-300 transition-all" href={`/${user?.nick}/?aba=chat`}>Clique aqui</a> e abra um ticket para conversar diretamente com um atendente.</p>

                    <div className={`${backCampoClass} mb-6`}>
                        <label className={`${titleClass}`}>Escolher imagens:</label>
                        <input
                            type="file"
                            multiple // Permite selecionar vários
                            onChange={(e) => {
                                if (e.target.files) {
                                    const filesArray = Array.from(e.target.files);
                                    setNovaArte({
                                        ...novaArte,
                                        enviarArquivo: filesArray // Salva o array de arquivos
                                    });
                                }
                            }}
                            className={`${campoClass}`}
                        />

                    </div>

                    <div className="flex flex-col border border-orange-combat max-[610px]:border-none p-5 max-[610px]:p-0 mb-5 gap-2">
                        <h5 className="text-[18px] font-semibold text-orange-combat mb-2.5">* Informações Gerais:</h5>

                        <div className="flex flex-col gap-3 mb-2 ">
                            <label className="text-xs text-gray-400 ml-1">Informações gerais:</label>
                            <textarea
                                required
                                rows={5}
                                name="outras_infos"
                                className="p-3 bg-neutral-grayish border border-gray-700 focus:border-orange-combat outline-none transition-colors w-full"
                                value={novaArte.infos_gerais}
                                onChange={e => setNovaArte({ ...novaArte, infos_gerais: e.target.value })}
                            />
                            <p className="text-[12px]"><strong>Obs.:</strong> <br />* Para criar sua arte simples, informe-nos tudo que quer imaginando ela pronta.<br /> * Quais os textos que vão nesta arte?<br /> * Você está carregando alguma imagem, logomarca, etc, como você quer que seja implementado?<br /> * Você sabe a resolução que quer a imagem? Ou é para algum lugar específico, ex: post do instagram, ou reel, etc.</p>

                        </div>
                    </div>

                </div>

                <div className="flex flex-col items-center">
                    <button
                        disabled={isSending}
                        type="submit"
                        className={`w-70 cursor-pointer px-10 max-[610px]:w-55 py-2 bg-orange-combat hover:bg-white hover:text-orange-combat font-bold transition-all uppercase text-sm ${isSending ? 'opacity-50' : ''}`}>
                        {isSending ? 'Finalizando Pedido...' : 'Finalizar Pedido'}
                    </button>
                </div>

            </form>
        </div>
    )
}

export const VisualizarPedidoCriarArteSimples = () => {
    const [dadosPedido, setDadosPedido] = useState<any>(null);
    const [carregando, setCarregando] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<any>(null);
    const [imagensParaRemover, setImagensParaRemover] = useState<string[]>([]);
    const [novosArquivos, setNovosArquivos] = useState<File[]>([]);

    const { id } = useParams();
    const { checkingAuth, isLogged, logout, user, setGlobalLoading } = useContext(AuthContext);

    useEffect(() => {
        if (!id) return;

        if (dadosPedido && dadosPedido.id === Number(id)) return;

        setCarregando(true);
        setGlobalLoading(true);

        api.get(`/pedido/${id}`)
            .then((res) => {
                // Se a API retornar um array, pegamos o primeiro item
                const pedido = Array.isArray(res.data) ? res.data[0] : res.data;

                console.log("PEDIDO CARREGADO:", pedido); // Verifique isso no console!

                setDadosPedido(pedido);

                if (pedido.dadosForm) {
                    try {
                        const parsed = typeof pedido.dadosForm === 'string'
                            ? JSON.parse(pedido.dadosForm)
                            : pedido.dadosForm;
                        setFormData(parsed);
                    } catch (e) {
                        console.error("Erro ao dar parse no dadosForm", e);
                    }
                }
            })
            .catch(err => console.error("Erro na API:", err))
            .finally(() => {
                setCarregando(false);
                setGlobalLoading(false); // Garante que o loading global da Auth encerre
            });
    }, [id]);

    if (!isLogged) {
        return <Navigate to="/login" state={{ from: `/formulario/${id}/view` }} />;
    }

    if (checkingAuth) return <div className="text-white">Verificando autenticação...</div>;

    if (carregando) return <p>Carregando dados do pedido...</p>;

    if (!dadosPedido) return <p className="text-white p-10">Pedido não encontrado.</p>;

    const renderizarValor = (nomeDoCampo: string, valorExtra?: any) => {
        // Se passarmos valorExtra (para arquivosEnviados), usamos ele. 
        // Caso contrário, usamos o que está no formData.
        const valorAtual = valorExtra !== undefined ? valorExtra : formData[nomeDoCampo];

        if (!valorAtual || (Array.isArray(valorAtual) && valorAtual.length === 0)) {
            return <span className="text-gray-500">---</span>;
        }

        // Lógica para detectar se é um array de Imagens (URLs do Cloudinary)
        const ehArrayDeImagens = Array.isArray(valorAtual) &&
            typeof valorAtual[0] === 'string' &&
            (valorAtual[0].includes('http') || valorAtual[0].includes('res.cloudinary.com'));

        if (ehArrayDeImagens) {
            return (
                <div className="flex flex-wrap gap-2">
                    {valorAtual.map((url: string, idx: number) => (
                        <a key={idx} href={url} target="_blank" rel="noreferrer" className="relative group">
                            <img
                                src={url}
                                alt="Upload"
                                className="w-24 h-24 object-cover border border-orange-combat hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px]">
                                Ver full
                            </div>
                        </a>
                    ))}
                </div>
            );
        }

        // ... sua lógica de Array.isArray (para subcampos) continua aqui ...
        if (Array.isArray(valorAtual) && typeof valorAtual[0] === 'object') {
            return (
                <div className="flex flex-col gap-2 w-full">
                    {valorAtual.map((item: any, index: number) => (
                        <div key={index} className="bg-neutral-900 p-2 mr-2 border border-gray-700">
                            {Object.entries(item).map(([subCampo, subValor]) => (
                                <div key={subCampo} className="text-sm">
                                    <label className="text-[10px] text-gray-400 uppercase">{subCampo}</label>
                                    {isEditing ? (
                                        <input
                                            className="w-full bg-gray-900 border border-gray-700 p-1 text-sm"
                                            value={formData[nomeDoCampo][index][subCampo]}
                                            onChange={(e) => handleInputChange(nomeDoCampo, e.target.value, index, subCampo)}
                                        />
                                    ) : (
                                        <p className="text-white p-1 bg-neutral-grayish text-sm">{String(subValor || '---')}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            );
        }

        // Renderização padrão para texto
        return isEditing ? (
            <input
                className="w-full bg-gray-900 border border-gray-700 p-1 text-sm text-white"
                value={String(valorAtual || '')}
                onChange={(e) => handleInputChange(nomeDoCampo, e.target.value)}
            />
        ) : (
            <span className="bg-neutral-800 mr-2 text-sm text-white font-regular border border-gray-700 p-1">
                {String(valorAtual || '---')}
            </span>
        );
    };

    const handleSave = async () => {
        setGlobalLoading(true);

        const formDataEnvio = new FormData();

        formDataEnvio.append('dadosForm', JSON.stringify(formData));
        formDataEnvio.append('removerImagens', JSON.stringify(imagensParaRemover));
        novosArquivos.forEach((file) => {
            formDataEnvio.append('arquivosEnviados', file);
        });

        try {
            await api.put(`/pedido/${id}`, formDataEnvio, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert("Pedido atualizado com sucesso!");
            window.location.reload(); // Recarrega para pegar as novas URLs do Cloudinary
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar alterações.");
        } finally {
            setGlobalLoading(false);
        }
    };

    const handleInputChange = (campo: string, valor: any, index?: number, subcampo?: string) => {
        setFormData((prev: any) => {
            const newData = { ...prev };

            if (index !== undefined && subcampo) {
                const novoArray = [...newData[campo]];
                novoArray[index] = { ...novoArray[index], [subcampo]: valor };
                newData[campo] = novoArray;
            } else {
                newData[campo] = valor;
            }

            return newData;
        })
    }

    if (!formData) return <p>Pedido não encontrado.</p>;

    return (
        <div className="min-h-screen flex justify-center items-center text-white bg-linear-to-r from-[#FF3300] via-[#FF5900] to-[#803100]">
            <div className="bg-neutral-grayish border border-gray-700 p-8 items-center my-2.5 min-[1139px]:w-280 min-[610px]:w-139 min-[320px]:w-71">

                {/* Cabeçalho de Navegação e Botões de Edição */}
                <div className="flex gap-3 justify-end">
                    <a className="hover:text-orange-combat transition-all" href={`/${user?.nick}?aba=meus_pedidos`}>Voltar</a>
                    <p>|</p>
                    <a className="cursor-pointer hover:text-orange-combat transition-all" onClick={logout}>Sair</a>
                </div>

                <div className="flex gap-2 justify-end my-5">
                    <button onClick={() => setIsEditing(!isEditing)} className="cursor-pointer px-4 py-1 bg-orange-combat hover:bg-gray-700 transition-all font-semibold">
                        {isEditing ? "Cancelar" : "Editar"}
                    </button>
                    {isEditing && (
                        <button onClick={handleSave} className="cursor-pointer px-4 py-1 bg-orange-combat hover:bg-gray-700 transition-all font-semibold">
                            Salvar
                        </button>
                    )}
                </div>

                <h1 className="text-2xl font-bold text-orange-combat">Visualizando pedido</h1>

                <div className="mt-6 bg-neutral-dark-grayish p-4 border border-gray-700">
                    <h2 className="text-lg font-semibold">{dadosPedido.job?.nome || "Serviço"}</h2>
                    <p className="text-sm text-gray-400">Status: {dadosPedido.status}</p>
                </div>

                <div className="container mx-auto p-6 max-[610px]:p-0 text-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* BLOCO 1: TEXTOS (dadosForm) */}
                        {formData ? Object.keys(formData).map((chave) => (
                            <div key={chave} className="flex flex-col border-l-2 border-orange-combat pl-4 py-2 bg-neutral-dark-grayish">
                                <label className="text-xs text-orange-combat uppercase font-bold mb-2">
                                    {chave.replace(/_/g, ' ')}
                                </label>
                                {renderizarValor(chave)}
                            </div>
                        )) : (
                            <p className="text-gray-500">Nenhuma informação textual.</p>
                        )}

                        {/* BLOCO 2: IMAGENS (arquivosEnviados) - INDEPENDENTE DO FORM DATA */}
                        {dadosPedido.arquivosEnviados && dadosPedido.arquivosEnviados.length > 0 && (
                            <div className="flex flex-col border-l-2 border-orange-combat pl-4 py-2 bg-neutral-dark-grayish col-span-1 md:col-span-2">
                                <label className="text-xs text-orange-combat uppercase font-bold mb-2">
                                    Arquivos Enviados
                                </label>
                                <div className="flex flex-wrap gap-3 mt-2">
                                    {dadosPedido.arquivosEnviados
                                        .filter((url: string) => !imagensParaRemover.includes(url)) // Esconde as removidas
                                        .map((url: string, index: number) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={url}
                                                    className="w-32 h-32 object-cover border border-orange-combat"
                                                />
                                                {isEditing && (
                                                    <button
                                                        onClick={() => setImagensParaRemover([...imagensParaRemover, url])}
                                                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 cursor-pointer shadow-lg"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                        ))}

                                    {isEditing && (
                                        <div className="mt-4 border-2 border-dashed border-gray-600 p-4 w-full">
                                            <label className="text-xs text-gray-400 block mb-2">Adicionar novas imagens:</label>
                                            <input
                                                type="file"
                                                multiple
                                                onChange={(e) => e.target.files && setNovosArquivos(Array.from(e.target.files))}
                                                className="text-sm"
                                            />
                                            {novosArquivos.length > 0 && (
                                                <p className="text-orange-combat text-xs mt-1">{novosArquivos.length} novos arquivos selecionados.</p>
                                            )}
                                        </div>
                                    )}

                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}