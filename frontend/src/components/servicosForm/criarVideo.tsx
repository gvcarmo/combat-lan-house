import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { useConfirm } from "react-use-confirming-dialog";

export const CriarVideoForm = () => {
    const [isSending, setIsSending] = useState(false);

    const { serviceName } = useParams();

    const { setGlobalLoading, user } = useContext(AuthContext);

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        chave_pix_tipo: '',
        chave_pix: '',
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

                <div className="mt-1 p-4 bg-blue-500/10 hover:bg-blue-500/30 border-l-4 border-blue-500 text-blue-500 w-full transition-all">
                    <p className="text-xs font-bold uppercase tracking-wider mb-1 transition-all">🛡️ Serviço feito pelo Chat</p>
                    <p className="text-[11px] leading-relaxed text-white/90">* Só finalize o pedido se o Atendente confirmar que está tudo certo para continuar.</p>
                    <p className="text-[11px] leading-relaxed text-white/90">* Após a finalização do pedido você será redirecionado para seu painel, para fazer o pagamento e ter acesso ao resultado.</p>
                </div>


                <div className="flex flex-col p-5 max-[610px]:p-0 gap-2">
                    <h5 className="text-[18px] font-semibold text-orange-combat mb-2.5">Dados Necessários:</h5>

                    <div className="flex gap-4 max-[610px]:flex-col">
                        <div className={`${backCampoClass} max-[610px]:w-full w-1/2`}>
                            <label className={`${titleClass}`}><span className="text-[16px] text-red-500">*</span> Sua Chave Pix (Tipo):</label>
                            <select
                                required
                                name="chave_pix_tipo"
                                className={`${campoClass}`}
                                value={formData.chave_pix_tipo}
                                onChange={e => setFormData({ ...formData, chave_pix_tipo: e.target.value })}
                            >
                                <option value="">Selecionar um tipo de chave pix...</option>
                                <option value="civel">CPF</option>
                                <option value="criminal">Celular</option>
                                <option value="eleitoral">E-mail</option>
                            </select>
                        </div>

                        <div className={`${backCampoClass} flex flex-col gap-2 max-[610px]:w-full w-1/2`}>
                            <label className={`${titleClass}`}><span className="text-[16px] text-red-500">*</span>  Chave Pix:</label>
                            <input
                                required
                                name="chave_pix"
                                placeholder="Ex.: Celular"
                                className={`${campoClass}`}
                                value={formData.chave_pix}
                                onChange={e => setFormData({ ...formData, chave_pix: e.target.value })}
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
