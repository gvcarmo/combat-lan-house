import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { useConfirm } from "react-use-confirming-dialog";

interface NovaArteState {
    infos_gerais: string,
    enviarArquivo: File[];
}

export const FormCriarArte = () => {
    const [isSending, setIsSending] = useState(false);

    const { serviceName } = useParams();

    const { setGlobalLoading, user } = useContext(AuthContext);

    const navigate = useNavigate();

    const [novaArte, setNovaArte] = useState<NovaArteState>({
        infos_gerais: '',
        enviarArquivo: []
    })

    const confirm = useConfirm()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();

        formData.append('jobSlug', serviceName || "");

        const dadosParaEnvio = {
            infos_gerais: novaArte.infos_gerais,
            // adicione aqui outros campos se houver
        };
        formData.append('dadosForm', JSON.stringify(dadosParaEnvio));

        novaArte.enviarArquivo.forEach((file) => {
            formData.append('arquivosEnviados', file);
        });

        setIsSending(true);
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

    const backCampoClass = `border-l-2 border-orange-combat bg-neutral-dark-grayish py-2 pl-4 flex flex-col gap-1 md:col-span-2 mb-6`
    const titleClass = `text-xs text-orange-combat uppercase font-bold mb-1`
    const campoClass = `p-1 mr-2 text-sm bg-neutral-grayish border border-gray-700 focus:border-orange-combat outline-none transition-colors resize-none`

    return (
        <div className="w-full">
            <form onSubmit={handleSubmit} id="submit" className="flex flex-col mt-5 gap-2">

                <div className="flex flex-col p-5 max-[610px]:p-0 gap-2">
                    <h5 className="text-[18px] font-semibold text-orange-combat mb-2.5">Dados Necessários:</h5>

                    <p className="text-[12px]">* Selecione todas as imagens que deseja enviar de uma só vez (basta colocar todas em uma pasta para selecionar):</p>

                    <div className={`${backCampoClass} mb-6`}>
                        <label className={`${titleClass}`}>Escolher imagens:</label>
                        <input
                            type="file"
                            multiple // Permite selecionar vários
                            onChange={(e) => {
                                if (e.target.files) {
                                    const filesArray = Array.from(e.target.files);
                                    setNovaArte({
                                        ...novaArte,
                                        enviarArquivo: filesArray // Salva o array de arquivos
                                    });
                                }
                            }}
                            className={`${campoClass}`}
                        />

                    </div>

                    <div className="flex flex-col border border-orange-combat max-[610px]:border-none p-5 max-[610px]:p-0 mb-5 gap-2">
                        <h5 className="text-[18px] font-semibold text-orange-combat mb-2.5">* Informações Gerais:</h5>

                        <div className="flex flex-col gap-3 mb-2 ">
                            <label className="text-xs text-gray-400 ml-1">Informações gerais:</label>
                            <textarea
                                required
                                rows={5}
                                name="outras_infos"
                                className="p-3 bg-neutral-grayish border border-gray-700 focus:border-orange-combat outline-none transition-colors w-full"
                                value={novaArte.infos_gerais}
                                onChange={e => setNovaArte({ ...novaArte, infos_gerais: e.target.value })}
                            />
                            <p className="text-[12px]"><strong>Obs.:</strong> <br />* Para criar sua arte simples, informe-nos tudo que quer imaginando ela pronta.<br /> * Quais os textos que vão nesta arte?<br /> * Você está carregando alguma imagem, logomarca, etc, como você quer que seja implementado?<br /> * Você sabe a resolução que quer a imagem? Ou é para algum lugar específico, ex: post do instagram, ou reel, etc.</p>

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