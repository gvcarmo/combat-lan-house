import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

export const FormAntPF = () => {
    const [isSending, setIsSending] = useState(false);

    const { serviceName } = useParams();

    const { setGlobalLoading, user } = useContext(AuthContext);

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nome_completo: '',
        cpf: '',
        data_nascimento: '',
        nome_da_mae: '',
        nome_do_pai: '',
        nacionalidade: '',
        pais_de_nascimento: '',
        uf_de_nascimento: '',
        municipio_de_nascimento: '',
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

                    <div className="flex max-[610px]:flex-col gap-4">
                        <div className={`${backCampoClass} w-1/2 max-[610px]:w-full`}>
                            <label className={`${titleClass}`}><span className="text-[16px] text-red-500">*</span>  CPF:</label>
                            <input
                                required
                                name="cpf"
                                maxLength={14}
                                placeholder="Ex.: 000.000.000-00"
                                className={`${campoClass}`}
                                value={formData.cpf}
                                onChange={e => setFormData({ ...formData, cpf: e.target.value })}
                            />
                        </div>
                        <div className={`${backCampoClass} w-1/2 max-[610px]:w-full`}>
                            <label className={`${titleClass}`}><span className="text-[16px] text-red-500">*</span>  Data de Nascimento:</label>
                            <input
                                required
                                name="data_nascimento"
                                maxLength={10}
                                placeholder="Ex.: DD/MM/AAAA"
                                className={`${campoClass}`}
                                value={formData.data_nascimento}
                                onChange={e => setFormData({ ...formData, data_nascimento: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className={`${backCampoClass}`}>
                        <label className={`${titleClass}`}><span className="text-[16px] text-red-500">*</span>  Nome Completo da Mãe:</label>
                        <input
                            required
                            name="nome_da_mae"
                            placeholder="Ex.: Isabel da Silva Santos"
                            className={`${campoClass}`}
                            value={formData.nome_da_mae}
                            onChange={e => setFormData({ ...formData, nome_da_mae: e.target.value })}
                        />
                    </div>

                    <div className={`${backCampoClass}`}>
                        <label className={`${titleClass}`}>Nome Completo do Pai:</label>
                        <input
                            name="nome_do_pai"
                            placeholder="Ex.: Marcus Santos Silva"
                            className={`${campoClass}`}
                            value={formData.nome_do_pai}
                            onChange={e => setFormData({ ...formData, nome_do_pai: e.target.value })}
                        />
                    </div>

                    <div className="flex max-[610px]:flex-col gap-4">
                        <div className={`${backCampoClass} w-1/2 max-[610px]:w-full`}>
                            <label className={`${titleClass}`}>Nacionalidade:</label>
                            <input
                                name="nacionalidade"
                                maxLength={14}
                                placeholder="Ex.: 000.000.000-00"
                                className={`${campoClass}`}
                                value={formData.nacionalidade}
                                onChange={e => setFormData({ ...formData, nacionalidade: e.target.value })}
                            />
                        </div>
                        <div className={`${backCampoClass} w-1/2 max-[610px]:w-full`}>
                            <label className={`${titleClass}`}>País de Nascimento:</label>
                            <input
                                name="pais_de_nascimento"
                                maxLength={10}
                                placeholder="Ex.: DD/MM/AAAA"
                                className={`${campoClass}`}
                                value={formData.pais_de_nascimento}
                                onChange={e => setFormData({ ...formData, pais_de_nascimento: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex max-[610px]:flex-col gap-4">
                        <div className={`${backCampoClass} w-1/2 max-[610px]:w-full`}>
                            <label className={`${titleClass}`}>UF de Nascimento:</label>
                            <input
                                name="uf_de_nascimento"
                                maxLength={14}
                                placeholder="Ex.: 000.000.000-00"
                                className={`${campoClass}`}
                                value={formData.uf_de_nascimento}
                                onChange={e => setFormData({ ...formData, uf_de_nascimento: e.target.value })}
                            />
                        </div>
                        <div className={`${backCampoClass} w-1/2 max-[610px]:w-full`}>
                            <label className={`${titleClass}`}>Município de Nascimento:</label>
                            <input
                                name="municipio_de_nascimento"
                                maxLength={10}
                                placeholder="Ex.: DD/MM/AAAA"
                                className={`${campoClass}`}
                                value={formData.municipio_de_nascimento}
                                onChange={e => setFormData({ ...formData, municipio_de_nascimento: e.target.value })}
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
