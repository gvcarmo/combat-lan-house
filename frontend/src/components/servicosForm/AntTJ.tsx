import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { useConfirm } from "react-use-confirming-dialog";

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

    const confirm = useConfirm()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSending(true);
        setGlobalLoading(true);
        const proceed = await confirm({
            title: "FINALIZAR PEDIDO",
            message: "Tem certeza que deseja finalizar o pedido?",
            confirmText: "Finalizar Pedido",
            cancelText: "Cancelar",
            confirmColor: "#f97316",
            confirmTextFont: "Inter, sans-serif",
            cancelTextFont: "Inter, sans-serif",
            dialogTextFont: "Georgia, serif"
        })
        if (proceed) {
            setGlobalLoading(true);
            try {
                const proceed = await confirm({
                    title: "PEDIDO FINALIZADO",
                    message: "Pedido realizado com sucesso! Você será redirecionado para o pagamento no seu painel, onde poderá acompanhar o andamento do seu pedido.",
                    confirmText: "Confirmar",
                    cancelText: "Cancelar",
                    confirmColor: "#f97316",
                    confirmTextFont: "Inter, sans-serif",
                    cancelTextFont: "Inter, sans-serif",
                    dialogTextFont: "Georgia, serif"
                })
                if (proceed) {
                    const response = await api.post('/pedidos', {
                        jobSlug: serviceName,
                        dadosForm: {
                            ...formData
                        }
                    });

                    const novoPedidoId = response.data.id;

                    navigate(`/${user?.nick}?aba=meus_pedidos&pagar=${novoPedidoId}`);
                }
            } catch (error) {
                alert("Erro ao enviar, verifique os dados.")

            } finally {
                setGlobalLoading(false);
                setIsSending(true);
            }
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
                                <label className={`${titleClass}`}><span className="text-[16px] text-red-500">*</span>  Natureza:</label>
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
                                <label className={`${titleClass}`}><span className="text-[16px] text-red-500">*</span>  Comarca:</label>
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
                            <label className={`${titleClass}`}><span className="text-[16px] text-red-500">*</span>  Pessoa:</label>
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
                            <label className={`${titleClass}`}><span className="text-[16px] text-red-500">*</span>  Nome:</label>
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
                            <label className={`${titleClass}`}><span className="text-[16px] text-red-500">*</span>  Nome Completo:</label>
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
                            <label className={`${titleClass}`}><span className="text-[16px] text-red-500">*</span>  CPF:</label>
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