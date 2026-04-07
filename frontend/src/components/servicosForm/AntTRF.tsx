import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { useConfirm } from "react-use-confirming-dialog";

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

                    <div className={`${backCampoClass}`}>
                        <label className={`${titleClass}`}><span className="text-[16px] text-red-500">*</span>  Nome Completo do Cidadão:</label>
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
                        <label className={`${titleClass}`}><span className="text-[16px] text-red-500">*</span>  Tipo de Certidão:</label>
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
                        <label className={titleClass}><span className="text-[16px] text-red-500">*</span> Órgão(s):</label>

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
                            <label className={`${titleClass}`}><span className="text-[16px] text-red-500">*</span>  CPF ou CNPJ:</label>
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