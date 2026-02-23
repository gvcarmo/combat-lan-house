import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

export const FormContrato = () => {
    const [isSending, setIsSending] = useState(false);
    const [enderecoLocador, setEnderecoLocador] = useState({ rua: '', numero: '', bairro: '', cidade: '' })
    const [enderecoImovel, setEnderecoImovel] = useState({ rua: '', numero: '', bairro: '', cidade: '' })
    const [enderecoFiador, setEnderecoFiador] = useState({ rua: '', numero: '', bairro: '', cidade: '' })

    const { serviceName } = useParams();

    const { setGlobalLoading, user } = useContext(AuthContext);

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nome_completo_locador: '',
        cpf_locador: '',
        endereco_locador: [{ rua: '', numero: '', bairro: '', cidade: '' }],
        nome_completo_locatario: '',
        cpf_locatario: '',
        endereco_imovel: [{ rua: '', numero: '', bairro: '', cidade: '' }],
        prazo_locacao: '',
        data_inicio_locacao: '',
        valor_aluguel: '',
        nome_completo_fiador: '',
        cpf_fiador: '',
        endereco_fiador: [{ rua: '', numero: '', bairro: '', cidade: '' }],
        data_para_assinatura: '',
        outras_infos: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const enderecoLocadorFinal = `${enderecoLocador.rua}, ${enderecoLocador.numero}, ${enderecoLocador.bairro}, ${enderecoLocador.cidade}`;
        const enderecoImovelFinal = `${enderecoImovel.rua}, ${enderecoImovel.numero}, ${enderecoImovel.bairro}, ${enderecoImovel.cidade}`;
        const enderecoFiadorFinal = `${enderecoImovel.rua}, ${enderecoImovel.numero}, ${enderecoImovel.bairro}, ${enderecoImovel.cidade}`;

        setIsSending(true);
        setGlobalLoading(true);
        try {
            const response = await api.post('/pedidos', {
                jobSlug: serviceName,
                dadosForm: {
                    ...formData,
                    endereco_locador: enderecoLocadorFinal,
                    endereco_imovel: enderecoImovelFinal,
                    endereco_fiador: enderecoFiadorFinal
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

                    <p className="text-xs mb-4">Atenção! Caso tenha alguma dúvida você pode colocar no campo 'Outras informações relevantes' no fim deste formulário, caso necessite de ajuda ou uma atenção maior, <a className="text-blue-500 hover:text-blue-300 transition-all" href={`/${user?.nick}/?aba=chat`}>Clique aqui</a> e abra um ticket para conversar diretamente com um atendente.</p>


                    <div className="flex flex-col">
                        <h5 className="font-semibold text-orange-combat mb-2.5">Dados do Locador:</h5>

                        <div className="flex max-[1139px]:flex-col gap-4">
                            <div className={`${backCampoClass} w-1/2 max-[1139px]:w-full`}>
                                <label className={`${titleClass}`}>* Nome completo do Locador:</label>
                                <input
                                    required
                                    name="nome_completo_locador"
                                    maxLength={14}
                                    placeholder="Ex.: Marcus Santos Silva"
                                    className={`${campoClass}`}
                                    value={formData.nome_completo_locador}
                                    onChange={e => setFormData({ ...formData, nome_completo_locador: e.target.value })}
                                />
                            </div>
                            <div className={`${backCampoClass} w-1/2 max-[1139px]:w-full`}>
                                <label className={`${titleClass}`}>* CPF do Locador:</label>
                                <input
                                    required
                                    name="cpf_locador"
                                    maxLength={14}
                                    placeholder="Ex.: 000.000.000-00"
                                    className={`${campoClass}`}
                                    value={formData.cpf_locador}
                                    onChange={e => setFormData({ ...formData, cpf_locador: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex gap-3 max-[610px]:flex-col">
                                <div className={`${backCampoClass} w-2/3 max-[610px]:w-full `}>
                                    <label className={`${titleClass}`}>* Rua do Locador:</label>
                                    <input
                                        required
                                        placeholder="Ex.: Rua Dr. Adilson Resende Facure"
                                        className={`${campoClass}`}
                                        value={enderecoLocador.rua}
                                        onChange={(e) => setEnderecoLocador({ ...enderecoLocador, rua: e.target.value })}
                                    />
                                </div>

                                <div className={`${backCampoClass} w-1/3 max-[610px]:w-full `}>
                                    <label className={`${titleClass}`}>* Número:</label>
                                    <input
                                        required
                                        placeholder="Ex.: 694"
                                        className={`${campoClass}`}
                                        value={enderecoLocador.numero}
                                        onChange={(e) => setEnderecoLocador({ ...enderecoLocador, numero: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 max-[610px]:flex-col">
                                <div className={`${backCampoClass} w-1/3 max-[610px]:w-full `}>
                                    <label className={`${titleClass}`}>* Bairro:</label>
                                    <input
                                        required
                                        placeholder="Ex.: Boa Vista"
                                        className={`${campoClass}`}
                                        value={enderecoLocador.bairro}
                                        onChange={(e) => setEnderecoLocador({ ...enderecoLocador, bairro: e.target.value })}
                                    />
                                </div>

                                <div className={`${backCampoClass} w-2/3 max-[610px]:w-full`}>
                                    <label className={`${titleClass}`}>* Cidade / Estado:</label>
                                    <input
                                        required
                                        placeholder="Ex.: Uberaba/MG"
                                        className={`${campoClass}`}
                                        value={enderecoLocador.cidade}
                                        onChange={(e) => setEnderecoLocador({ ...enderecoLocador, cidade: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="flex flex-col">
                        <h5 className="font-semibold text-orange-combat mb-2.5">Dados do Locatário:</h5>

                        <div className="flex max-[1139px]:flex-col gap-4">
                            <div className={`${backCampoClass} w-1/2 max-[1139px]:w-full`}>
                                <label className={`${titleClass}`}>* Nome completo do Locatário:</label>
                                <input
                                    required
                                    name="nome_completo_locatario"
                                    maxLength={14}
                                    placeholder="Ex.: Marcus Santos Silva"
                                    className={`${campoClass}`}
                                    value={formData.nome_completo_locatario}
                                    onChange={e => setFormData({ ...formData, nome_completo_locatario: e.target.value })}
                                />
                            </div>
                            <div className={`${backCampoClass} w-1/2 max-[1139px]:w-full`}>
                                <label className={`${titleClass}`}>* CPF do Locatário:</label>
                                <input
                                    required
                                    name="cpf_locatario"
                                    maxLength={14}
                                    placeholder="Ex.: 000.000.000-00"
                                    className={`${campoClass}`}
                                    value={formData.cpf_locatario}
                                    onChange={e => setFormData({ ...formData, cpf_locatario: e.target.value })}
                                />
                            </div>
                        </div>

                    </div>

                    <div className="flex flex-col">
                        <h5 className="font-semibold text-orange-combat mb-2.5">Do Imóvel a ser Locado:</h5>

                        <div className="flex flex-col gap-2">
                            <div className="flex gap-3 max-[610px]:flex-col">
                                <div className={`${backCampoClass} w-2/3 max-[610px]:w-full `}>
                                    <label className={`${titleClass}`}>* Rua do Imóvel:</label>
                                    <input
                                        required
                                        placeholder="Ex.: Rua Dr. Adilson Resende Facure"
                                        className={`${campoClass}`}
                                        value={enderecoImovel.rua}
                                        onChange={(e) => setEnderecoImovel({ ...enderecoImovel, rua: e.target.value })}
                                    />
                                </div>

                                <div className={`${backCampoClass} w-1/3 max-[610px]:w-full `}>
                                    <label className={`${titleClass}`}>* Número:</label>
                                    <input
                                        required
                                        placeholder="Ex.: 694"
                                        className={`${campoClass}`}
                                        value={enderecoImovel.numero}
                                        onChange={(e) => setEnderecoImovel({ ...enderecoImovel, numero: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 max-[610px]:flex-col">
                                <div className={`${backCampoClass} w-1/3 max-[610px]:w-full `}>
                                    <label className={`${titleClass}`}>* Bairro:</label>
                                    <input
                                        required
                                        placeholder="Ex.: Boa Vista"
                                        className={`${campoClass}`}
                                        value={enderecoImovel.bairro}
                                        onChange={(e) => setEnderecoImovel({ ...enderecoImovel, bairro: e.target.value })}
                                    />
                                </div>

                                <div className={`${backCampoClass} w-2/3 max-[610px]:w-full`}>
                                    <label className={`${titleClass}`}>* Cidade / Estado:</label>
                                    <input
                                        required
                                        placeholder="Ex.: Uberaba/MG"
                                        className={`${campoClass}`}
                                        value={enderecoImovel.cidade}
                                        onChange={(e) => setEnderecoImovel({ ...enderecoImovel, cidade: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex max-[1139px]:flex-col gap-4">
                            <div className={`${backCampoClass} w-1/3 max-[1139px]:w-full`}>
                                <label className={`${titleClass}`}>* Prazo de locação:</label>
                                <input
                                    required
                                    name="prazo_locacao"
                                    placeholder="Ex.: 1 ano"
                                    className={`${campoClass}`}
                                    value={formData.prazo_locacao}
                                    onChange={e => setFormData({ ...formData, prazo_locacao: e.target.value })}
                                />
                            </div>
                            <div className={`${backCampoClass} w-1/3 max-[1139px]:w-full`}>
                                <label className={`${titleClass}`}>* Data de início da Locação:</label>
                                <input
                                    required
                                    name="data_inicio_locacao"
                                    placeholder="Ex.: 01/10/2027"
                                    className={`${campoClass}`}
                                    value={formData.data_inicio_locacao}
                                    onChange={e => setFormData({ ...formData, data_inicio_locacao: e.target.value })}
                                />
                            </div>
                            <div className={`${backCampoClass} w-1/3 max-[1139px]:w-full`}>
                                <label className={`${titleClass}`}>* Valor do Aluguel:</label>
                                <input
                                    required
                                    name="valor_aluguel"
                                    placeholder="Ex.: R$ 1000,00"
                                    className={`${campoClass}`}
                                    value={formData.valor_aluguel}
                                    onChange={e => setFormData({ ...formData, valor_aluguel: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={`${backCampoClass} w-1/3 max-[1139px]:w-full`}>
                        <label className={`${titleClass}`}>Data que irão Assinar o contrato:</label>
                        <input
                            name="data_para_assinatura"
                            placeholder="Ex.: Dia seguinte"
                            className={`${campoClass}`}
                            value={formData.data_para_assinatura}
                            onChange={e => setFormData({ ...formData, data_para_assinatura: e.target.value })}
                        />
                    </div>


                    <div className="flex flex-col">
                        <h5 className="font-semibold text-orange-combat mb-2.5">Dados do Fiador (opcional):</h5>

                        <div className="flex max-[1139px]:flex-col gap-4">
                            <div className={`${backCampoClass} w-1/2 max-[1139px]:w-full`}>
                                <label className={`${titleClass}`}>Nome completo do Fiador:</label>
                                <input
                                    name="nome_completo_fiador"
                                    maxLength={14}
                                    placeholder="Ex.: Marcus Santos Silva"
                                    className={`${campoClass}`}
                                    value={formData.nome_completo_fiador}
                                    onChange={e => setFormData({ ...formData, nome_completo_fiador: e.target.value })}
                                />
                            </div>
                            <div className={`${backCampoClass} w-1/2 max-[1139px]:w-full`}>
                                <label className={`${titleClass}`}>CPF do Fiador:</label>
                                <input
                                    name="cpf_fiador"
                                    maxLength={14}
                                    placeholder="Ex.: 000.000.000-00"
                                    className={`${campoClass}`}
                                    value={formData.cpf_fiador}
                                    onChange={e => setFormData({ ...formData, cpf_fiador: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex gap-3 max-[610px]:flex-col">
                                <div className={`${backCampoClass} w-2/3 max-[610px]:w-full `}>
                                    <label className={`${titleClass}`}>Rua do Fiador:</label>
                                    <input
                                        placeholder="Ex.: Rua Dr. Adilson Resende Facure"
                                        className={`${campoClass}`}
                                        value={enderecoFiador.rua}
                                        onChange={(e) => setEnderecoFiador({ ...enderecoFiador, rua: e.target.value })}
                                    />
                                </div>

                                <div className={`${backCampoClass} w-1/3 max-[610px]:w-full `}>
                                    <label className={`${titleClass}`}>Número:</label>
                                    <input
                                        placeholder="Ex.: 694"
                                        className={`${campoClass}`}
                                        value={enderecoFiador.numero}
                                        onChange={(e) => setEnderecoFiador({ ...enderecoFiador, numero: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 max-[610px]:flex-col">
                                <div className={`${backCampoClass} w-1/3 max-[610px]:w-full `}>
                                    <label className={`${titleClass}`}>Bairro:</label>
                                    <input
                                        placeholder="Ex.: Boa Vista"
                                        className={`${campoClass}`}
                                        value={enderecoFiador.bairro}
                                        onChange={(e) => setEnderecoFiador({ ...enderecoFiador, bairro: e.target.value })}
                                    />
                                </div>

                                <div className={`${backCampoClass} w-2/3 max-[610px]:w-full`}>
                                    <label className={`${titleClass}`}>Cidade / Estado:</label>
                                    <input
                                        placeholder="Ex.: Uberaba/MG"
                                        className={`${campoClass}`}
                                        value={enderecoFiador.cidade}
                                        onChange={(e) => setEnderecoFiador({ ...enderecoFiador, cidade: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                    </div>






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

export const VisualizarPedidoContratoRes = () => {
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