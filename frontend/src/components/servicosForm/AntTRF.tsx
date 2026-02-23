import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

interface FormDataProps {
    nome_completo: string;
    tipo: string;
    orgaos: string[];
    cpf_ou_cnpj: string;
    outras_infos: string;
}

export const FormAntTRF1 = () => {
    const [isSending, setIsSending] = useState(false);

    const { serviceName } = useParams();

    const { setGlobalLoading, user } = useContext(AuthContext);

    const navigate = useNavigate();

    const [formData, setFormData] = useState<FormDataProps>({
        nome_completo: '',
        tipo: '',
        orgaos: [],
        cpf_ou_cnpj: '',
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

    const handleSelectOrgao = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const novoValor = e.target.value;

        if (novoValor && !formData.orgaos.includes(novoValor)) {
            setFormData({
                ...formData,
                orgaos: [...(formData.orgaos as string[]), novoValor]
            });
        }
        e.target.value = "";
    };

    const removerOrgao = (itemParaRemover: any) => {
        setFormData({
            ...formData,
            orgaos: formData.orgaos.filter(item => item !== itemParaRemover)
        });
    };

    const backCampoClass = `border-l-2 border-orange-combat bg-neutral-dark-grayish py-2 pl-4 flex flex-col gap-1 md:col-span-2 mb-6`
    const titleClass = `text-xs text-orange-combat uppercase font-bold mb-1`
    const campoClass = `p-1 mr-2 text-sm bg-neutral-grayish border border-gray-700 focus:border-orange-combat outline-none transition-colors resize-none`

    return (
        <div className="w-full">
            <form onSubmit={handleSubmit} id="submit" className="flex flex-col mt-5 gap-2">

                <div className="flex flex-col p-5 max-[610px]:p-0 gap-2">
                    <h5 className="text-[18px] font-semibold text-orange-combat mb-2.5">Dados Necessários:</h5>

                    <p className="text-xs mb-4">Atenção! Caso você não tenha certeza de qual antecedentes criminais deve apresentar, <a className="text-blue-500 hover:text-blue-300 transition-all" href={`/${user?.nick}/?aba=chat`}>Clique aqui</a> e abra um ticket para conversar diretamente com um atendente.</p>

                    <div className={`${backCampoClass}`}>
                        <label className={`${titleClass}`}>* Nome Completo do Cidadão:</label>
                        <input
                            required
                            name="nome_completo"
                            placeholder="Ex.: Marcos da Silva Santos"
                            className={`${campoClass}`}
                            value={formData.nome_completo}
                            onChange={e => setFormData({ ...formData, nome_completo: e.target.value })}
                        />
                    </div>

                    <div className={`${backCampoClass} max-[610px]:w-full w-1/2`}>
                        <label className={`${titleClass}`}>* Tipo de Certidão:</label>
                        <select
                            required
                            name="tipo"
                            className={`${campoClass}`}
                            value={formData.tipo}
                            onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                        >
                            <option value="">Selecionar um tipo de certidão...</option>
                            <option value="civel">Cível</option>
                            <option value="criminal">Criminal</option>
                            <option value="eleitoral">Para fins eleitorais</option>
                        </select>
                    </div>

                    <div className={`${backCampoClass} flex flex-col gap-2 max-[610px]:w-full w-1/2`}>
                        <label className={titleClass}>* Órgão(s):</label>

                        <div className="flex flex-wrap gap-2">
                            {formData.orgaos.map((orgao) => (
                                <span key={orgao} className="bg-slate-400 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2">
                                    {orgao}
                                    <button
                                        type="button"
                                        onClick={() => removerOrgao(orgao)}
                                        className="font-bold hover:text-red-200"
                                    >
                                        ✕
                                    </button>
                                </span>
                            ))}
                        </div>

                        <select
                            name="orgaos"
                            className={campoClass}
                            value=""
                            onChange={handleSelectOrgao}
                        >
                            <option value="" disabled>Selecionar Órgão(s)</option>
                            <option value="ACRE">SEÇÃO JUDICIÁRIA DO ESTADO DO ACRE</option>
                            <option value="AMAZONAS">SEÇÃO JUDICIÁRIA DO ESTADO DO AMAZONAS</option>
                            <option value="AMAPA">SEÇÃO JUDICIÁRIA DO ESTADO DO AMAPÁ</option>
                            <option value="BAHIA">SEÇÃO JUDICIÁRIA DO ESTADO DO BAHIA</option>
                            <option value="DISTRITO FEDERAL">SEÇÃO JUDICIÁRIA DO DISTRITO FEDERAL</option>
                            <option value="GOIAS">SEÇÃO JUDICIÁRIA DO ESTADO DE GOIÁS</option>
                            <option value="MARANHÃO">SEÇÃO JUDICIÁRIA DO ESTADO DO MARANHÃO</option>
                            <option value="MATO GROSSO">SEÇÃO JUDICIÁRIA DO ESTADO DE MATO GROSSO</option>
                            <option value="PARÁ">SEÇÃO JUDICIÁRIA DO ESTADO DO PARÁ</option>
                            <option value="PIAUÍ">SEÇÃO JUDICIÁRIA DO ESTADO DO PIAUÍ</option>
                            <option value="RONDÔNIA">SEÇÃO JUDICIÁRIA DO ESTADO DE RONDÔNIA</option>
                            <option value="RORAIMA">SEÇÃO JUDICIÁRIA DO ESTADO DE RORAIMA</option>
                            <option value="TOCANTINS">SEÇÃO JUDICIÁRIA DO ESTADO DE TOCANTINS</option>
                            <option value="1REGIAO 2GRAU">TRIBUNAL REGIONAL FEDERAL DA 1ª REGIÃO (2º GRAU)</option>
                            <option value="VARAS, JUIZADOS E TURMAS">Varas, Juizados e Turmas Recursais (Todo o 1º Grau)</option>
                            <option value="Regionalizada">Regionalizada (1º e 2º Graus)</option>
                        </select>
                    </div>

                    <div className="flex max-[610px]:flex-col gap-4">
                        <div className={`${backCampoClass} w-1/2 max-[610px]:w-full`}>
                            <label className={`${titleClass}`}>* CPF ou CNPJ:</label>
                            <input
                                name="cpf_ou_cnpj"
                                placeholder="Ex.: 000.000.000-00 ou 00.000.000/0000-00"
                                className={`${campoClass}`}
                                value={formData.cpf_ou_cnpj}
                                onChange={e => setFormData({ ...formData, cpf_ou_cnpj: e.target.value })}
                            />
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

export const VisualizarPedidoAntTRF1 = () => {
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