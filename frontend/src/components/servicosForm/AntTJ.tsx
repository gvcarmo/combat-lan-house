import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

export const FormAntTJ = () => {
    const [isSending, setIsSending] = useState(false);

    const { serviceName } = useParams();

    const { setGlobalLoading, user } = useContext(AuthContext);

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        instancia: '',
        tipo: '',
        natureza: '',
        comarca: '',
        pessoa: '',
        nome_pessoa: '',
        nome_completo: '',
        cpf: '',
        outras_infos: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSending(true);
        setGlobalLoading(true);
        try {
            const response = await api.post('/pedidos', {
                jobSlug: serviceName,
                dadosForm: {
                    ...formData
                }
            });

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

                    <p className="text-xs mb-4">Atenção! Caso você não tenha certeza de qual antecedentes criminais deve apresentar, <a className="text-blue-500 hover:text-blue-300 transition-all" href={`/${user?.nick}/?aba=chat`}>Clique aqui</a> e abra um ticket para conversar diretamente com um atendente.</p>


                    <div className="mb-6">
                        <h5 className="text-[16px] font-semibold text-orange-combat mb-2.5">Certidão:</h5>

                        <div className="flex gap-4 max-[610px]:flex-col">
                            <div className={`${backCampoClass} max-[610px]:w-full w-1/2`}>
                                <label className={`${titleClass}`}>Instância:</label>
                                <select
                                    name="instancia"
                                    className={`${campoClass}`}
                                    value={formData.instancia}
                                    onChange={e => setFormData({ ...formData, instancia: e.target.value })}
                                >
                                    <option value="">Se não tiver certeza não selecione</option>
                                    <option value="1instancia">1ª Instância</option>
                                    <option value="2instancia">2ª Instância</option>
                                </select>
                            </div>

                            <div className={`${backCampoClass} max-[610px]:w-full w-1/2`}>
                                <label className={`${titleClass}`}>Tipo:</label>
                                <select
                                    name="tipo"
                                    className={`${campoClass}`}
                                    value={formData.tipo}
                                    onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                                >
                                    <option value="">Se não tiver certeza não selecione</option>
                                    <option value="normal">Normal</option>
                                    <option value="vitenaria">Vitenária</option>
                                    <option value="insolvencia">Insolvência</option>
                                    <option value="civel">Execução Cível</option>
                                    <option value="tutela-curatela">Tutela/ Curatela</option>
                                    <option value="falencia-e-concordata">Falência e Concordata</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-4 max-[610px]:flex-col">
                            <div className={`${backCampoClass} max-[610px]:w-full w-1/2`}>
                                <label className={`${titleClass}`}>* Natureza:</label>
                                <select
                                    required
                                    name="natureza"
                                    className={`${campoClass}`}
                                    value={formData.natureza}
                                    onChange={e => setFormData({ ...formData, natureza: e.target.value })}
                                >
                                    <option value="">Selecione uma natureza</option>
                                    <option value="criminal">Criminal</option>
                                    <option value="civel">Cível</option>
                                </select>
                            </div>

                            <div className={`${backCampoClass} max-[610px]:w-full w-1/2`}>
                                <label className={`${titleClass}`}>* Comarca:</label>
                                <input
                                    required
                                    name="comarca"
                                    placeholder="Ex.: Uberaba"
                                    className={`${campoClass}`}
                                    value={formData.comarca}
                                    onChange={e => setFormData({ ...formData, comarca: e.target.value })}
                                />
                            </div>
                        </div>

                    </div>

                    <div className="mb-6">
                        <h5 className="text-[16px] font-semibold text-orange-combat mb-2.5">Dados da Certidão:</h5>

                        <div className={`${backCampoClass}`}>
                            <label className={`${titleClass}`}>* Pessoa:</label>
                            <select
                                name="pessoa"
                                className={`${campoClass}`}
                                value={formData.pessoa}
                                onChange={e => setFormData({ ...formData, pessoa: e.target.value })}
                            >
                                <option value="">Física para CPF e Jurídica para CNPJ</option>
                                <option value="fisica">Física</option>
                                <option value="juridica">Jurídica</option>
                            </select>
                        </div>

                        <div className={`${backCampoClass}`}>
                            <label className={`${titleClass}`}>* Nome:</label>
                            <input
                                required
                                name="nome_pessoa"
                                className={`${campoClass}`}
                                value={formData.nome_pessoa}
                                onChange={e => setFormData({ ...formData, nome_pessoa: e.target.value })}
                            />
                            <p className="text-xs text-gray-400 mt-1">(Consulta por nome EXATAMENTE IGUAL ao digitado acima)</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h5 className="text-[16px] font-semibold text-orange-combat mb-2.5">Solicitante:</h5>

                        <div className={`${backCampoClass}`}>
                            <label className={`${titleClass}`}>* Nome Completo:</label>
                            <input
                                required
                                placeholder="Ex.: Marcos da Silva Santos"
                                name="nome_completo"
                                className={`${campoClass}`}
                                value={formData.nome_completo}
                                onChange={e => setFormData({ ...formData, nome_completo: e.target.value })}
                            />
                        </div>

                        <div className={`${backCampoClass}`}>
                            <label className={`${titleClass}`}>* CPF:</label>
                            <input
                                required
                                name="cpf"
                                placeholder="000.000.000/00"
                                className={`${campoClass}`}
                                value={formData.cpf}
                                onChange={e => setFormData({ ...formData, cpf: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex flex-col border border-orange-combat max-[610px]:border-none p-5 max-[610px]:p-0 mb-5 gap-2">
                            <h5 className="text-[18px] font-semibold text-orange-combat mb-2.5">Outras informações relevantes:</h5>

                            <div className="flex flex-col gap-3 mb-2 ">
                                <label className="text-xs text-gray-400 ml-1">Informações adicionais (opcional):</label>
                                <textarea
                                    rows={5}
                                    name="outras_infos"
                                    className="p-3 bg-neutral-grayish border border-gray-700 focus:border-orange-combat outline-none transition-colors w-full"
                                    value={formData.outras_infos}
                                    onChange={e => setFormData({ ...formData, outras_infos: e.target.value })}
                                />
                                <p className="text-[12px]"><strong>Obs.:</strong> <br />* Deixe aqui quaisquer informações adicionais que queira compartilhar. </p>

                            </div>
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

export const VisualizarPedidoAntTJ = () => {
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
                    <a className="hover:text-orange-combat transition-all" href={`/${user?.nick}?aba=meus_pedidos`}>Voltar</a>
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