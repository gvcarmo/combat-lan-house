// Ao clicar em "Recuperar Senha":
// 1. (frontend) Abre janela com o input para preencher o e-mail;
// 2. (backend) Ao preencher o email, verifica se o email existe - OK
// 3. (backend) Token é enviado ao cliente - OK
// 4. email - Cliente clica no link e é redirecionado para uma página - OK
// 5. (frontend) verifica se o token é válido, se é valido, mostra input de troca de senha, feita a troca (preencher senha com requisitos) mostra msg de OK, ou se já expirou (retorna msg)

import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import api from "../../services/api";
import { useParams, useNavigate, Link } from "react-router-dom";

export const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isSending, setIsSending] = useState(false);

    const { isAdmin, isLogged, user, setGlobalLoading } = useContext(AuthContext);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        setIsSending(true);

        setGlobalLoading(true);

        try {
            await api.post('/forgotpassword', { email });
            alert('Se o e-mail estiver correto, um link de recuperação foi enviado!');
        } catch (error) {
            alert('Erro ao processar solicitação, verifique se o email está correto.');
        } finally {
            setIsSending(false);
            setGlobalLoading(false);
        }
    }

    return (
        <div className="h-screen bg-linear-to-r from-[#FF3300] via-[#FF5900] to-[#803100] flex items-center justify-center">
            <div className="flex justify-center my-2.5 text-white">
                <div className="w-94 bg-neutral-grayish border border-neutral-border-light-color p-8 flex flex-col items-center">
                    <h1 className="text-orange-combat text-xl font-bold mb-2">Recuperação de Senha</h1>

                    <p className="text-xs text-red-700">* Atenção! Verifique sua caixa de spam antes de fazer uma nova tentativa de envio.</p>
                    <p className="text-xs">* Atenção! Seu usuário será citado no e-mail de recuperação, caso não se lembre.</p>

                    {isAdmin && (
                        <p>Você está logado como <span className="text-orange-combat font-semibold">Administrador</span>.</p>
                    )}

                    {isLogged && user ? (
                        <div>
                            <p>Você já está logado <strong>{user.nick}</strong>.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} id="submit" className="flex flex-col p-5">
                            <div className="flex flex-col items-center">
                                <div className="flex flex-col gap-1 pb-5">
                                    <label className="text-xs text-gray-400 ml-1 mb-2">Insira o E-mail para recuperação de senha:</label>
                                    <input required
                                        className={`p-3 bg-neutral-grayish border border-gray-700 focus:border-orange-combat outline-none transition-colors`} type="email" minLength={4}
                                        pattern="^[a-z0-9.\-]+@[a-z0-9\-]+\.[a-z]{2,8}(\.[a-z]{2,8})?$"
                                        placeholder="Seu e-mail"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)} />

                                    <div className="flex justify-center mt-5">
                                        <button
                                            disabled={isSending}
                                            className="w-full cursor-pointer bg-orange-combat py-2 font-bold hover:bg-white hover:text-orange-combat transition-all disabled:opacity-50"
                                        >
                                            {isSending ? 'Enviando...' : 'Enviar Link'}
                                        </button>
                                    </div>
                                </div>
                                <Link to="/" className="hover:text-orange-combat transition-all duration-300 ease-in-out">Voltar para a página inicial</Link>
                            </div>
                        </form>
                    )}

                </div>
            </div>
        </div>
    )
}

export const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [isSending, setIsSending] = useState(false);

    const { setGlobalLoading } = useContext(AuthContext);

    async function handleReset(e: React.FormEvent) {
        e.preventDefault();

        if (novaSenha !== confirmarSenha) {
            return alert("As senhas não coincidem! Verifique e tente novamente.");
        }

        setIsSending(true);
        setGlobalLoading(true);
        try {
            await api.post(`/resetpassword/${token}`, { novaSenha });

            alert("Senha alterada com sucesso! Você será redirecionado para a página inicial.");
            navigate('/');
        } catch (error: any) {
            alert(error.response?.data?.error || "Erro ao resetar senha.");
        } finally {
            setIsSending(false);
            setGlobalLoading(false);
        }
    }

    return (
        <div className="flex h-screen justify-center items-center text-white bg-linear-to-r from-[#FF3300] via-[#FF5900] to-[#803100]">
            <div className="w-94 bg-neutral-grayish border border-neutral-border-light-color p-8 flex flex-col items-center">
                <h1 className="text-orange-combat text-xl font-bold mb-4">Criar Nova Senha</h1>

                <p className="text-xs text-red-700 mb-2">* Atenção! Verifique sua caixa de spam antes de fazer uma nova tentativa de envio.</p>

                <form onSubmit={handleReset} className="flex flex-col gap-4 w-72">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-400">Nova Senha:</label>
                        <input
                            required
                            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                            type="password"
                            className="p-3 bg-neutral-dark-grayish border border-gray-700 outline-none focus:border-orange-combat"
                            value={novaSenha}
                            onChange={(e) => setNovaSenha(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-400">Confirmar Nova Senha:</label>
                        <input
                            required
                            type="password"
                            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                            className="p-3 bg-neutral-dark-grayish border border-gray-700 outline-none focus:border-orange-combat"
                            value={confirmarSenha}
                            onChange={(e) => setConfirmarSenha(e.target.value)}
                        />
                    </div>
                    <p className="text-[12px] max-[610px]:p-0 max-[610px]:pt-2.5">Obs.:<br />
                        Deve conter ao menos 8 dígitos, e no máximo 20, incluindo uma letra maiúscula, uma minúscula e um número;
                    </p>

                    <button
                        disabled={isSending}
                        className="w-full cursor-pointer bg-orange-combat py-2 mt-4 font-bold hover:bg-white hover:text-orange-combat transition-all disabled:opacity-50"
                    >
                        {isSending ? "Processando..." : "Alterar Senha"}
                    </button>
                </form>
            </div>
        </div>
    );
};