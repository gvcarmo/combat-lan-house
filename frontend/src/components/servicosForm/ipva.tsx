import { useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import api from "../../services/api";

export const FormIPVA = () => {
    const [isSending, setIsSending] = useState(false);

    const { serviceName } = useParams();

    const { setGlobalLoading, user } = useContext(AuthContext);

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nome_completo: '',
        renavam: '',
        exercicio: '',
        outras_infos: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setGlobalLoading(true);
        setIsSending(true);
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

                    <div className={`${backCampoClass}`}>
                        <label className={`${titleClass}`}><span className="text-[16px] text-red-500">*</span> Nome Completo do Proprietário do Veículo:</label>
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
                        <label className={`${titleClass}`}><span className="text-[16px] text-red-500">*</span> Número do Renavam:</label>
                        <input
                            required
                            name="renavam"
                            type="text"
                            maxLength={11}
                            placeholder="Ex.: 99988899944"
                            className={`${campoClass}`}
                            value={formData.renavam}
                            onChange={e => setFormData({ ...formData, renavam: e.target.value })}
                        />
                    </div>

                    <div className={`${backCampoClass}`}>
                        <label className={`${titleClass}`}><span className="text-[16px] text-red-500">*</span> Ano do exercício:</label>
                        <input
                            required
                            name="exercicio"
                            type="text"
                            placeholder="Ex.: 2026"
                            className={`${campoClass}`}
                            value={formData.exercicio}
                            onChange={e => setFormData({ ...formData, exercicio: e.target.value })}
                        />
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
                            <p className="text-[12px]"><strong>Obs.:</strong> <br />* Caso não tenha certeza sobre alguma informação, sugiro que abra um ticket no painel de controle, enviando assim a foto do documento.</p>

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
