// No formulário será solicitado:
// Informações sobre o vídeo, como:
// Detalhes sobre cada mídia enviada, seja foto, vídeo, 
// Frases que precisam ser adicionadas, como legendas ou outros,
// Informações a ser inseridas no vídeo e se precisa de detalhes específicos
// É necessário que o cliente dê upload de todas as mídias que quer usar,
// E informe as que não tem pra que sejam colocadas
// Se tem logomarca para inserir também

import { Navigate, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";

// Tamanho do vídeo:
// até 30 segundos = R$ 30,00
// até entre 30s e 1min = R$ 50,00
// até 1:30s = 70,00 
// para negociar vídeos acima deste tamanho, abrir um ticket

export interface Pedido {
    infos: string;
    arquivosEnviados: File[];
}

export const CriarVideo = () => {
    const [isSending, setIsSending] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isImageUpload, setIsImageUpload] = useState(true);

    const { serviceName } = useParams();

    const { setGlobalLoading, user } = useContext(AuthContext);

    const navigate = useNavigate();

    const [criarVideo, setCriarVideo] = useState<Pedido>({
        infos: '',
        arquivosEnviados: []
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSending(true);

        const formData = new FormData();

        criarVideo.arquivosEnviados.forEach((file) => {
            formData.append('arquivosEnviados', file);
        });

        setGlobalLoading(true);
        try {
            await api.post('/pedidos', {
                jobSlug: serviceName,
                dadosForm: {
                    ...formData
                }
            });
            alert(`Pedido realizado com sucesso!`)

            navigate(`/${user?.nick}`)

        } catch (error) {
            alert("Erro ao enviar, verifique os dados.")

        } finally {
            setGlobalLoading(false);
            setIsSending(false);
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

                    {/* <div className={`${backCampoClass}`}>
                        <label className={`${titleClass}`}>: *</label>
                        <input
                            required
                            name="nome_completo"
                            placeholder="Ex.: Marcos da Silva Santos"
                            className={`${campoClass}`}
                            value={formData.nome_completo}
                            onChange={e => setFormData({ ...formData, nome_completo: e.target.value })}
                        />
                    </div> */}
                    <label>Enviar Imagem</label>
                    <input
                        type="file"
                        onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                                const filesArray = Array.from(e.target.files);

                                setSelectedFile(filesArray[0]);
                                setCriarVideo({
                                    ...criarVideo,
                                    arquivosEnviados: filesArray
                                });
                            }
                        }}
                        className="p-1 mr-2 text-sm bg-neutral-grayish border border-gray-700 focus:border-orange-combat outline-none transition-colors resize-none"
                    />

                    <div className="flex flex-col border border-orange-combat max-[610px]:border-none p-5 max-[610px]:p-0 mb-5 gap-2">
                        <h5 className="text-[18px] font-semibold text-orange-combat mb-2.5">Informações sobre o vídeo:</h5>

                        <div className="flex flex-col gap-3 mb-2 ">
                            <label className="text-xs text-gray-400 ml-1">Informações completas:</label>
                            <textarea
                                rows={5}
                                name="infos"
                                className="p-3 bg-neutral-grayish border border-gray-700 focus:border-orange-combat outline-none transition-colors w-full"
                                value={criarVideo.infos}
                                onChange={e => setCriarVideo({ ...criarVideo, infos: e.target.value })}
                            />
                            <p className="text-[12px]"><strong>Obs.:</strong> <br />* Informe sobre o seu vídeo, quais são seus fundamentos e finalidade;<br />* Informe todas as informações necessárias para criação do seu vídeo; <br />* A respeito de cada mídia carregada, é necessário a inserção de frases específicas, textos, nomes?<br />* Você tem logomarca? coloquea.</p>
                            <p className="text-[12px]"><strong>Dicas:</strong> <br />* Caso não tenha muita certeza sobre o que quer, sugiro que abra um ticket para ser atendido, e conversar sobre o mesmo. Para vídeos muito grandes é necessário abrir um ticket.</p>

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

export const VisualizarPedidoIPVA = () => {
    const [dadosPedido, setDadosPedido] = useState<any>(null);
    const [carregando, setCarregando] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<any>(null);

    const { id } = useParams();

    const { checkingAuth, isLogged, logout, user, setGlobalLoading } = useContext(AuthContext);

    useEffect(() => {
        if (!id) return;

        setCarregando(true);
        setGlobalLoading(true);

        api.get(`/pedido/${id}`)
            .then((res) => {
                setDadosPedido(res.data);
                if (res.data.dadosForm) {
                    setFormData(JSON.parse(res.data.dadosForm))
                }
            })
            .catch((err) => {
                console.error("3. Erro na Requisição:", err.response?.status, err.response?.data);
            })
            .finally(() => {
                setCarregando(false);
                setGlobalLoading(false);
            })
    }, [id]);

    if (!isLogged) {
        return <Navigate to="/login" state={{ from: `/formulario/${id}/view` }} />;
    }

    if (checkingAuth) return <div className="text-white">Verificando autenticação...</div>;

    if (carregando) return <p>Carregando dados do pedido...</p>;

    if (!formData || !dadosPedido) return <p className="text-white p-10">Pedido não encontrado.</p>;

    const renderizarValor = (nomeDoCampo: string) => {
        if (!formData || !formData[nomeDoCampo]) return <span className="text-gray-500">---</span>;

        const valorAtual = formData[nomeDoCampo];

        if (Array.isArray(valorAtual)) {
            return (
                <div className="flex flex-col gap-2 w-full">
                    {valorAtual.map((item, index) => (
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
        return isEditing ? (
            <input
                className="w-full bg-gray-900 border border-gray-700 p-1 text-sm text-white"
                value={String(formData[nomeDoCampo] || '')}
                onChange={(e) => handleInputChange(nomeDoCampo, e.target.value)}
            />
        ) : (
            <span className="bg-neutral-800 mr-2 text-sm text-white font-regular border border-gray-700 p-1">{String(valorAtual || '---')}</span>
        );
    };

    const handleSave = async () => {
        setGlobalLoading(true);
        try {
            await api.put(`/pedido/${id}`, {
                dadosForm: formData
            });
            setIsEditing(false);
            alert("Alterações salvas com sucesso!");
        } catch (error) {
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

                <div className="flex gap-3 justify-end">
                    <a className="hover:text-orange-combat transition-all" href={`/${user?.nick}`}>Voltar</a>
                    <p>|</p>
                    <a className="cursor-pointer hover:text-orange-combat transition-all" onClick={logout}>Sair</a>
                </div>

                <div className="flex gap-2 justify-end">

                    <div className="flex my-5">
                        <button onClick={() => setIsEditing(!isEditing)} className="cursor-pointer px-4 w-fit bg-orange-combat hover:bg-gray-700 transition-all font-semibold">
                            {isEditing ? "Cancelar" : "Editar"}
                        </button>
                    </div>
                    {isEditing && (
                        <div className="flex justify-end my-5">
                            <button onClick={handleSave} className="cursor-pointer px-4 w-fit bg-orange-combat hover:bg-gray-700 transition-all font-semibold">
                                Salvar
                            </button>
                        </div>
                    )}
                </div>

                <h1 className="text-2xl font-bold text-orange-combat">
                    Visualizando pedido
                </h1>
                <div className="mt-6 bg-neutral-dark-grayish p-4 border border-gray-700">
                    <h2 className="text-lg font-semibold">{dadosPedido.job.nome}</h2>
                    <p className="text-sm text-gray-400">Status: {dadosPedido.status}</p>
                </div>

                <div className="container mx-auto p-6 max-[610px]:p-0 text-white">
                    <h2 className="text-xl font-bold mb-6 text-orange-combat">{dadosPedido.job.nome}</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {formData && Object.keys(formData).map((chave) => (
                            <div key={chave} className="flex flex-col border-l-2 border-orange-combat pl-4 py-2 bg-neutral-dark-grayish">
                                <label className="text-xs text-orange-combat uppercase font-bold mb-2">
                                    {chave.replace(/_/g, ' ')}
                                </label>

                                {/* AQUI VOCÊ CHAMA A FUNÇÃO */}
                                {renderizarValor(chave)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}