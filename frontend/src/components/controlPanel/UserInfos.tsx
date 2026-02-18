import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { useParams } from "react-router-dom";
import api from "../../services/api";

export const UserInfos = () => {
    const { nick } = useParams();
    const { user: authUser, setGlobalLoading } = useContext(AuthContext);
    const [carregando, setCarregando] = useState(false);

    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get(`/usuarios`);

                const encontrou = res.data.find((u: any) =>
                    nick ? u.nick === nick : u.id === authUser?.id
                );

                setUserData(encontrou);
            } catch (error) {
                console.error("Erro ao buscar dados de usuário.", error);
            } finally {
                setLoading(false);
            }
        };

        if (authUser || nick) {
            fetchUsers();
        }
    }, [nick, authUser]);

    if (loading) return <div className="text-center p-10">Carregando dados...</div>;

    if (!userData) return <div className="p-10 text-center">Usuário não encontrado.</div>;

    const handleSolicitarReset = async () => {
        const confirmar = window.confirm(`Deseja enviar um link de recuperação para ${userData.email}?`);

        if (!confirmar) return;

        try {
            setCarregando(true);
            setGlobalLoading(true);
            console.log("DEBUG EMAIL:", userData.email);
            await api.post(`/forgotpassword`, { email: userData.email });

            alert("Sucesso! Verifique sua caixa de entrada (e o spam) para redefinir a senha.");
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.error || "Erro ao solicitar troca de senha.");
        } finally {
            setGlobalLoading(false);
            setCarregando(false);
        }
    }

    return (
        <div>

            <div className="my-5 flex flex-col items-center justify-center">
                <h3 className="mb-2.5 text-orange-combat font-semibold text-[18px] ">Minha Conta</h3>
            </div>
            <div className="flex flex-col border border-gray-700 p-5 mb-5 gap-2">
                <h5 className="mb-5">Dados de cadastro:</h5>
                <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-xs text-gray-400">Usuário:</label>
                    <div className="flex flex-col gap-1 md:col-span-2">
                        {userData?.nick}
                    </div>
                </div>

                <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-xs text-gray-400">Nome Completo:</label>
                    <div className="flex flex-col gap-1 md:col-span-2">
                        {userData?.nome_completo}
                    </div>
                </div>

                <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-xs text-gray-400">E-mail:</label>
                    <div className="flex flex-col gap-1 md:col-span-2">
                        {userData?.email}
                    </div>
                </div>

                <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-xs text-gray-400">Data de Nascimento:</label>
                    <div className="flex flex-col gap-1 md:col-span-2">
                        {userData?.birthday}
                    </div>
                </div>

                <hr className="border-gray-700 my-2" />

                {/* Ações de Segurança */}
                <div className="flex flex-col gap-3">
                    <h5 className="text-white font-medium">Segurança</h5>
                    <label className="text-xs text-gray-400">Senha:</label>
                    <button onClick={handleSolicitarReset} disabled={carregando} className={`cursor-pointer w-full md:w-max text-sm bg-gray-700 text-white py-2 px-4 hover:bg-gray-600 transition-all ${carregando
                        ? 'bg-gray-700 cursor-not-allowed'
                        : 'bg-orange-combat text-white hover:bg-gray-700'}`}>
                        {carregando ? 'Enviando e-mail...' : 'Resetar Senha (via E-mail)'}
                    </button>
                </div>

            </div>

        </div>
    )
}