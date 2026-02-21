import { Navigate, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";

export const FormCurriculo = () => {
    const { setGlobalLoading, user } = useContext(AuthContext);
    const [isSending, _setIsSending] = useState(false);
    const [nascimento, setNascimento] = useState({ dia: '', mes: '', ano: '' });
    const [endereco, setEndereco] = useState({ rua: '', numero: '', bairro: '', cidade: '' })
    const { serviceName } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nome_completo: '',
        data_nascimento: [{ dia: '', mes: '', ano: '' }],
        estado_civil: '',
        endereco: [{ rua: '', numero: '', bairro: '', cidade: '' }],
        telefones: [{ tel: '' }],
        email: '',
        cnh: '',
        escolaridade: [{ nome: '' }],
        cursos: [{ nome: '' }],
        experiencias: [{ empresa: '', cargo: '', tempo: '', infos_add: '' }],
        outras_infos: ''
    });

    const LIMITE_CAMPOS = 3

    // Telefones
    const addTel = () => {
        if (formData.telefones.length >= LIMITE_CAMPOS) {
            alert(`Você pode adicionar no máximo ${LIMITE_CAMPOS} campos. Se necessário preencha em informações adicionais.`);
            return;
        }
        setFormData({
            ...formData,
            telefones: [...formData.telefones, { tel: '' }]
        })
    }

    const removeTel = (index: number) => {
        const newTel = formData.telefones.filter((_, i) => i !== index);
        setFormData({ ...formData, telefones: newTel });
    }

    const handleTelChange = (index: number, value: string) => {
        const newTel = [...formData.telefones];
        newTel[index].tel = value;
        setFormData({ ...formData, telefones: newTel })
    }

    // Escolaridade
    const addEscolaridade = () => {
        if (formData.escolaridade.length >= LIMITE_CAMPOS) {
            alert(`Você pode adicionar no máximo ${LIMITE_CAMPOS} campos. Se necessário preencha em informações adicionais.`);
            return;
        }
        setFormData({
            ...formData,
            escolaridade: [...formData.escolaridade, { nome: '' }]
        })
    }

    const removeEscolaridade = (index: number) => {
        const newEscolaridade = formData.escolaridade.filter((_, i) => i !== index);
        setFormData({ ...formData, escolaridade: newEscolaridade });
    }

    const handleEscolaridadeChange = (index: number, value: string) => {
        const newEscolaridade = [...formData.escolaridade];
        newEscolaridade[index].nome = value;
        setFormData({ ...formData, escolaridade: newEscolaridade })
    }

    // Cursos
    const addCursos = () => {
        if (formData.cursos.length >= LIMITE_CAMPOS) {
            alert(`Você pode adicionar no máximo ${LIMITE_CAMPOS} campos. Se necessário preencha em informações adicionais.`);
            return;
        }
        setFormData({
            ...formData,
            cursos: [...formData.cursos, { nome: '' }]
        })
    }

    const removeCurso = (index: number) => {
        const newCurso = formData.cursos.filter((_, i) => i !== index);
        setFormData({ ...formData, cursos: newCurso });
    }

    const handleCursoChange = (index: number, value: string) => {
        const newCurso = [...formData.cursos];
        newCurso[index].nome = value;
        setFormData({ ...formData, cursos: newCurso })
    }

    // Experiencias Profissionais
    const addExperiencia = () => {
        if (formData.experiencias.length >= LIMITE_CAMPOS) {
            alert(`Você pode adicionar no máximo ${LIMITE_CAMPOS} campos. Se necessário preencha em informações adicionais.`);
            return;
        }
        setFormData({
            ...formData,
            experiencias: [...formData.experiencias, { empresa: '', cargo: '', tempo: '', infos_add: '' }]
        })
    }

    const removeExperiencia = (index: number) => {
        const newExperiencia = formData.experiencias.filter((_, i) => i !== index);
        setFormData({ ...formData, experiencias: newExperiencia });
    }

    const handleExperienciaChange = (index: number, field: string, value: string) => {
        const newExperiencia = [...formData.experiencias];
        (newExperiencia[index] as any)[field] = value;
        setFormData({ ...formData, experiencias: newExperiencia });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const dataFinal = `${nascimento.dia}/${nascimento.mes}/${nascimento.ano}`
        const enderecoFinal = `${endereco.rua}, ${endereco.numero}, ${endereco.bairro}, ${endereco.cidade}`;

        setGlobalLoading(true);
        try {
            const response = await api.post('/pedidos', {
                jobSlug: serviceName,
                dadosForm: {
                    ...formData,
                    data_nascimento: dataFinal,
                    endereco: enderecoFinal,
                },
                arquivosEnviados: []
            });

            const novoPedidoId = response.data.id;

            alert(`Pedido realizado com sucesso! Realize o pagamento.`);

            navigate(`/${user?.nick}?aba=meus_pedidos&pagar=${novoPedidoId}`);

        } catch (error) {
            return ("Erro ao enviar, verifique os dados.")
        } finally {
            setGlobalLoading(false);
        }
    };

    const backCampoClass = `border-l-2 border-orange-combat bg-neutral-dark-grayish py-2 pl-4 flex flex-col gap-1 md:col-span-2 mb-6`
    const titleClass = `text-xs text-orange-combat uppercase font-bold mb-1`
    const campoClass = `p-1 mr-2 text-sm bg-neutral-grayish border border-gray-700 focus:border-orange-combat outline-none transition-colors resize-none`

    return (
        <div className="w-full">
            <form onSubmit={handleSubmit} id="submit" action="post" className="flex flex-col mt-5 gap-2">
                <div className="flex flex-col p-5 max-[610px]:p-0 mb-5 gap-2">
                    <h5 className="text-[18px] font-semibold text-orange-combat mb-2.5">Dados pessoais:</h5>

                    <div className={`${backCampoClass}`}>
                        <label className={`${titleClass}`}>Nome Completo: *</label>
                        <input
                            required
                            name="nome_completo"
                            placeholder="Ex.: Marcos da Silva Santos"
                            className={`${campoClass}`}
                            value={formData.nome_completo}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={`${backCampoClass} max-[1139px]:pr-2`}>
                        <label className={`${titleClass}`}>Data de Nascimento: *</label>
                        <div className="flex gap-3 max-[1139px]:flex-col">
                            <input
                                required
                                placeholder="Dia"
                                maxLength={2}
                                className={`${campoClass} w-1/3 max-[1139px]:w-full`}
                                value={nascimento.dia}
                                onChange={(e) => setNascimento({ ...nascimento, dia: e.target.value })}
                            />

                            <input
                                required
                                placeholder="Mês"
                                maxLength={2}
                                className={`${campoClass} w-1/3 max-[1139px]:w-full`}
                                value={nascimento.mes}
                                onChange={(e) => setNascimento({ ...nascimento, mes: e.target.value })}
                            />

                            <input
                                required
                                placeholder="Ano"
                                maxLength={4}
                                className={`${campoClass} w-1/3 max-[1139px]:w-full`}
                                value={nascimento.ano}
                                onChange={(e) => setNascimento({ ...nascimento, ano: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className={`${backCampoClass}`}>
                        <label className={`${titleClass}`}>Estado Civil: *</label>
                        <input
                            required
                            name="estado_civil"
                            placeholder="Ex.: Amasiado, Casado, Solteiro, Divorciado"
                            className={`${campoClass}`}
                            value={formData.estado_civil}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex gap-3 max-[610px]:flex-col">
                            <div className={`${backCampoClass} w-2/3 max-[610px]:w-full `}>
                                <label className={`${titleClass}`}>Endereço: *</label>
                                <input
                                    required
                                    placeholder="Ex.: Rua Dr. Adilson Resende Facure"
                                    className={`${campoClass}`}
                                    value={endereco.rua}
                                    onChange={(e) => setEndereco({ ...endereco, rua: e.target.value })}
                                />
                            </div>

                            <div className={`${backCampoClass} w-1/3 max-[610px]:w-full `}>
                                <label className={`${titleClass}`}>Número: *</label>
                                <input
                                    required
                                    placeholder="Ex.: 694"
                                    className={`${campoClass}`}
                                    value={endereco.numero}
                                    onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 max-[610px]:flex-col">
                            <div className={`${backCampoClass} w-1/3 max-[610px]:w-full `}>
                                <label className={`${titleClass}`}>Bairro: *</label>
                                <input
                                    required
                                    placeholder="Ex.: Boa Vista"
                                    className={`${campoClass}`}
                                    value={endereco.bairro}
                                    onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })}
                                />
                            </div>

                            <div className={`${backCampoClass} w-2/3 max-[610px]:w-full`}>
                                <label className={`${titleClass}`}>Cidade / Estado:</label>
                                <input
                                    placeholder="Ex.: Uberaba/MG"
                                    className={`${campoClass}`}
                                    value={endereco.cidade}
                                    onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={`${backCampoClass}`}>
                        <label className={`${titleClass}`}>Telefones: *</label>

                        <div className="flex gap-3 md:col-span-2">
                            {formData.telefones.map((telefone, index) => (
                                <div key={index} className={`gap-1 mb-2 items-center w-full flex`}>
                                    <input
                                        required
                                        name="telefones"
                                        maxLength={11}
                                        placeholder="Ex.: 34998648555"
                                        className={`${campoClass} w-full`}
                                        value={telefone.tel}
                                        onChange={(e) => handleTelChange(index, e.target.value)}
                                    />
                                    {formData.telefones.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeTel(index)}
                                            className="text-red-900 px-2 cursor-pointer bg-neutral-grayish-dark hover:bg-neutral-grayish transition-colors rounded-full h-6"
                                        >
                                            x
                                        </button>
                                    )}
                                </div>
                            ))}

                        </div>
                        <button
                            type="button"
                            onClick={addTel}
                            className="cursor-pointer text-xs bg-gray-700 text-white py-1 px-2 w-fit hover:bg-gray-600 transition-colors">
                            + Add outro tel
                        </button>
                    </div>


                    <div className={`${backCampoClass}`}>
                        <label className={`${titleClass}`}>Email:</label>
                        <input
                            placeholder="Ex.: marcos_silva@gmail.com"
                            name="email"
                            type="email"
                            pattern="^[a-z0-9.\-]+@[a-z0-9\-]+\.[a-z]{2,8}(\.[a-z]{2,8})?$"
                            className={`${campoClass}`}
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex gap-3">
                        <div className={`${backCampoClass} w-1/2`}>
                            <label className={`${titleClass}`}>CNH:</label>
                            <input
                                placeholder="Ex.: A/B"
                                name="cnh"
                                className={`${campoClass}`}
                                value={formData.cnh}
                                onChange={handleChange}
                            />
                        </div>

                    </div>


                </div>

                <div className="flex flex-col p-5 max-[610px]:p-0 mb-5 gap-2">
                    <h5 className="text-[18px] font-semibold text-orange-combat mb-2.5">Formação Acadêmica:</h5>
                    <div className={`${backCampoClass}`}>
                        <label className={`${titleClass}`}>Escolaridade: *</label>
                        <div className="flex flex-col gap-1 md:col-span-2">

                            {formData.escolaridade.map((escolaridade, index) => (
                                <div key={index} className="flex gap-1 mb-2 items-center">
                                    <input
                                        required
                                        placeholder="Digite sua escolaridade ou formação superior"
                                        className={`${campoClass} w-full`}
                                        value={escolaridade.nome}
                                        onChange={(e) => handleEscolaridadeChange(index, e.target.value)}
                                    />
                                    {formData.escolaridade.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeEscolaridade(index)}
                                            className="text-red-900 px-2 cursor-pointer bg-neutral-grayish-dark hover:bg-neutral-grayish transition-colors rounded-full h-6 mr-2"
                                        >
                                            x
                                        </button>
                                    )}
                                </div>
                            ))}
                            <p className="text-[12px]"><strong>Obs.:</strong> Você pode digitar sua formação superior, e no mesmo campo adicionar o nome da instituição e data de conclusão se achar necessário.</p>
                        </div>
                        <button
                            type="button"
                            onClick={addEscolaridade}
                            className="cursor-pointer text-xs bg-gray-700 text-white py-1 px-2 w-fit hover:bg-gray-600 transition-colors">
                            + Add outra formação
                        </button>
                    </div>

                    <div className={`${backCampoClass}`}>
                        <label className={`${titleClass}`}>Cursos:</label>
                        <div className="flex flex-col gap-1 md:col-span-2">

                            {formData.cursos.map((curso, index) => (
                                <div key={index} className="flex gap-1 mb-2 items-center">
                                    <input
                                        placeholder="Ex.: Inglês Avançado - Ciel - 4 anos"
                                        className={`${campoClass} w-full`}
                                        value={curso.nome}
                                        onChange={(e) => handleCursoChange(index, e.target.value)}
                                    />
                                    {formData.cursos.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeCurso(index)}
                                            className="text-red-900 px-2 cursor-pointer bg-neutral-grayish-dark hover:bg-neutral-grayish transition-colors rounded-full h-6 mr-2"
                                        >
                                            x
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={addCursos}
                            className="cursor-pointer text-xs bg-gray-700 text-white py-1 px-2 w-fit hover:bg-gray-600 transition-colors">
                            + Add curso
                        </button>
                    </div>
                </div>


                <div className="flex flex-col p-5 max-[610px]:p-0 mb-5 gap-2">
                    <h5 className="text-[18px] font-semibold text-orange-combat mb-2.5">Experiências Profissionais:</h5>
                    <div className={`${backCampoClass}`}>
                        <label className={`${titleClass}`}>Empresa:</label>
                        <div className="flex flex-col gap-1 md:col-span-2">

                            {formData.experiencias.map((experiencia, index) => (
                                <div key={index} className="flex flex-col gap-3 mb-2 ">
                                    <input
                                        placeholder="Digite o nome da empresa"
                                        className={`${campoClass}`}
                                        value={experiencia.empresa}
                                        onChange={(e) => handleExperienciaChange(index, 'empresa', e.target.value)}
                                    />
                                    <div className="flex gap-3 max-[610px]:flex-col max-[610px]:pr-2">
                                        <input
                                            placeholder="Digite o cargo"
                                            className={`${campoClass} w-1/2 max-[610px]:w-full `}
                                            value={experiencia.cargo}
                                            onChange={(e) => handleExperienciaChange(index, 'cargo', e.target.value)}
                                        />
                                        <input
                                            placeholder="Digite o tempo ou datas"
                                            className={`${campoClass} w-1/2 max-[610px]:w-full`}
                                            value={experiencia.tempo}
                                            onChange={(e) => handleExperienciaChange(index, 'tempo', e.target.value)}
                                        />
                                    </div>
                                    <input
                                        placeholder="Informações adicionais"
                                        className={`${campoClass}`}
                                        value={experiencia.infos_add}
                                        onChange={(e) => handleExperienciaChange(index, 'infos_add', e.target.value)}
                                    />

                                    {formData.experiencias.length > 1 && (
                                        <div className="flex justify-center">
                                            <button
                                                type="button"
                                                onClick={() => removeExperiencia(index)}
                                                className="text-red-900 px-2 cursor-pointer bg-neutral-grayish-dark hover:bg-neutral-grayish transition-colors rounded-full h-6 w-6"
                                            >
                                                x
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={addExperiencia}
                            className="cursor-pointer text-xs bg-gray-700 text-white py-1 px-2 w-fit hover:bg-gray-600 transition-colors">
                            + Add empresa
                        </button>
                    </div>
                </div>

                <div className="flex flex-col border border-orange-combat max-[610px]:border-none p-5 max-[610px]:p-0 mb-5 gap-2">
                    <h5 className="text-[18px] font-semibold text-orange-combat mb-2.5">Outras informações relevantes:</h5>

                    <div className="flex flex-col gap-3 mb-2 ">
                        <label className="text-xs text-gray-400 ml-1">Informações adicionais:</label>
                        <textarea
                            rows={5}
                            name="outras_infos"
                            className="p-3 bg-neutral-grayish border border-gray-700 focus:border-orange-combat outline-none transition-colors w-full"
                            value={formData.outras_infos}
                            onChange={handleChange}
                        />
                        <p className="text-[12px]"><strong>Obs.:</strong> <br />* Você pode citar aqui, Habilidades técnicas como, trabalho em equipe, facilidade em aprendizado, ou até mesmo habilidades que envolve o setor que quer se ingressar. <br />* Entre outras informações que você achar interessante como Objetivo, se você quer ingressar em um cargo específico, deixe aqui citado para que possamos construir uma frase adequada. <br />* Caso seja primeiro emprego, basta deixar os campos de experiência em branco.</p>

                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <button
                        disabled={isSending}
                        type="submit"
                        className={`mt-5 w-70 cursor-pointer px-10 max-[610px]:w-55 py-2 bg-orange-combat hover:bg-white hover:text-orange-combat font-bold transition-all uppercase text-sm ${isSending ? 'opacity-50' : ''}`}>
                        {isSending ? 'Finalizando Pedido...' : 'Finalizar Pedido'}
                    </button>
                </div>
            </form >
        </div >
    )
}

export const VisualizarPedidoCurriculo = () => {
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
                    <h2 className="text-xl font-bold mb-6 text-orange-combat">{dadosPedido.job.nome}o</h2>

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