import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

export const FormIPTU = () => {
    const [isSending, setIsSending] = useState(false);

    const { serviceName } = useParams();

    const { setGlobalLoading, user } = useContext(AuthContext);

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nome_completo: '',
        endereco: '',
        numero: '',
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

                    <div className={`${backCampoClass}`}>
                        <label className={`${titleClass}`}><span className="text-[16px] text-red-500">*</span> Nome Completo do Proprietário do Imóvel:</label>
                        <input
                            required
                            name="nome_completo"
                            placeholder="Ex.: Marcos da Silva Santos"
                            className={`${campoClass}`}
                            value={formData.nome_completo}
                            onChange={e => setFormData({ ...formData, nome_completo: e.target.value })}
                        />
                    </div>
                    <div className={`${backCampoClass}`}>
                        <label className={`${titleClass}`}><span className="text-[16px] text-red-500">*</span> Endereço do Imóvel:</label>
                        <input
                            required
                            name="endereco"
                            placeholder="Ex.: Rua Dr. Adilson Resende Facure"
                            className={`${campoClass}`}
                            value={formData.endereco}
                            onChange={e => setFormData({ ...formData, endereco: e.target.value })}
                        />
                    </div>
                    <div className="flex max-[610px]:flex-col gap-4">
                        <div className={`${backCampoClass} w-1/2 max-[610px]:w-full`}>
                            <label className={`${titleClass}`}><span className="text-[16px] text-red-500">*</span> Número:</label>
                            <input
                                required
                                name="numero"
                                placeholder="Ex.: 200, casa 2"
                                className={`${campoClass}`}
                                value={formData.numero}
                                onChange={e => setFormData({ ...formData, numero: e.target.value })}
                            />
                        </div>
                        <div className={`${backCampoClass} w-1/2 max-[610px]:w-full`}>
                            <label className={`${titleClass}`}>Outras infos:</label>
                            <input
                                name="outras_infos"
                                placeholder="Ex.: Apartamento Numero 101 bloco 2 / Condomínio Cinza"
                                className={`${campoClass}`}
                                value={formData.outras_infos}
                                onChange={e => setFormData({ ...formData, outras_infos: e.target.value })}
                            />
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
