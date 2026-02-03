import { menuLinks } from "../../data/linksMenuData";
import { useState, useContext, useRef, useEffect } from "react";
import api from '../../services/api'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from "../../contexts/AuthContext";

export const Menu = () => {
    const [isOpen, setIsOpen] = useState(false);

    const [loginIsOpen, setLoginIsOpen] = useState(false);

    const loginRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (loginIsOpen && loginRef.current && !loginRef.current.contains(event.target as Node)) {
                setLoginIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [loginIsOpen]);

    function toggleMenu() {
        setIsOpen(!isOpen);
    }

    function toggleLogin() {
        setLoginIsOpen(!loginIsOpen);
    }

    return (
        <header className="relative w-full flex justify-center h-22.5 bg-linear-[29deg,#101010_0%,#131313_23%,#131313_83%,#101010_100%] border-b  border-[#000000]">
            <div className="w-285 max-[1150px]:w-191.75 max-[767px]:w-93.5 h-full mx-auto flex items-center justify-between">
                <a onClick={toggleLogin} href="#login" className="flex items-center gap-2 mb-3">
                    <img className="h-15 ml-5 hover:scale-105 transition-all uration-300 ease-in-out" src="./logo.svg" alt="Logo Combat Lan House" />
                </a>

                <div className="flex max-[767px]:hidden">
                    {menuLinks.map((link, index) => (
                        <a className="menuLink" key={index} href={link.href}>
                            {link.svgPath}
                        </a>
                    ))}
                </div>

                <button onClick={toggleMenu} className={`hamburgerButton cursor-pointer max-[767px]:block max-[450px]:p-10 hidden flex-col justify-between w-30 h-26`}>
                    <svg width="30" height="26" viewBox="0 0 30 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect y="21" width="30" height="5" fill="white" />
                        <rect y="11" width="30" height="5" fill="white" />
                        <rect width="30" height="5" fill="white" />
                    </svg>
                </button>

                <div className={`hamburgerMenu ${isOpen ? 'active' : ''} flex items-center flex-col min-[767px]:hidden absolute top-22.5 right-0 w-full h-screen z-50 bg-linear-[29deg,#101010_0%,#131313_23%,#131313_83%,#101010_100%] border-b  border-b-[#000000]`}>
                    {menuLinks.map((link, index) => (
                        <a onClick={() => setIsOpen(false)} className="menuLink" key={index} href={link.href}>
                            {link.svgPath}
                        </a>
                    ))}
                </div>
            </div>

            <a className="fixed flex items-center justify-center z-50 bottom-8 right-8 w-20 h-20 rounded-full bg-neutral-dark-grayish border border-neutral-very-light-grayish cursor-pointer hover:scale-105 transition-all duration-300 ease-in-out max-[510px]:bottom-3 max-[510px]:right-3 max-[510px]:w-15 max-[510px]:h-15" href="https://wa.me/+5534" target="_blank">
                <svg width="40" height="40" viewBox="0 0 448 448" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M380.9 65.1C339 23.1 283.2 0 223.9 0C101.5 0 1.9 99.6 1.9 222C1.9 261.1 12.1 299.3 31.5 333L0 448L117.7 417.1C150.1 434.8 186.6 444.1 223.8 444.1H223.9C346.2 444.1 448 344.5 448 222.1C448 162.8 422.8 107.1 380.9 65.1ZM223.9 406.7C190.7 406.7 158.2 397.8 129.9 381L123.2 377L53.4 395.3L72 327.2L67.6 320.2C49.1 290.8 39.4 256.9 39.4 222C39.4 120.3 122.2 37.5 224 37.5C273.3 37.5 319.6 56.7 354.4 91.6C389.2 126.5 410.6 172.8 410.5 222.1C410.5 323.9 325.6 406.7 223.9 406.7ZM325.1 268.5C319.6 265.7 292.3 252.3 287.2 250.5C282.1 248.6 278.4 247.7 274.7 253.3C271 258.9 260.4 271.3 257.1 275.1C253.9 278.8 250.6 279.3 245.1 276.5C212.5 260.2 191.1 247.4 169.6 210.5C163.9 200.7 175.3 201.4 185.9 180.2C187.7 176.5 186.8 173.3 185.4 170.5C184 167.7 172.9 140.4 168.3 129.3C163.8 118.5 159.2 120 155.8 119.8C152.6 119.6 148.9 119.6 145.2 119.6C141.5 119.6 135.5 121 130.4 126.5C125.3 132.1 111 145.5 111 172.8C111 200.1 130.9 226.5 133.6 230.2C136.4 233.9 172.7 289.9 228.4 314C263.6 329.2 277.4 330.5 295 327.9C305.7 326.3 327.8 314.5 332.4 301.5C337 288.5 337 277.4 335.6 275.1C334.3 272.6 330.6 271.2 325.1 268.5Z" fill="white" />
                </svg>
            </a>

            <div ref={loginRef} className={`userLogin ${loginIsOpen ? 'active' : ''} w-92.5 h-75 bg-neutral-grayish border border-neutral-light-grayish absolute top-23.5 left-1 z-30 shadow-2xs text-white p-5 flex flex-col items-center`}>
                <p className="font-semibold text-[18px] mt-5 mb-7.5">Login de Usuário</p>
                    <button onClick={toggleLogin} className={`cursor-pointer bg-neutral-light-grayish text-white rounded-full px-2 border border-neutral-dark-grayish absolute right-6 hover:bg-orange-combat duration-300 transition-all ease-in-out`} >x</button>
                <Login />

            </div>

        </header>
    )
};

export function Login() {
    const [nick, setNick] = useState('');
    const [senha, setSenha] = useState('');
    const navigate = useNavigate();

    const { isLogged, isAdmin, user, login, logout } = useContext(AuthContext);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();

        try {
            const response = await api.post('/login', { nick, senha });

            const { token, user: userData } = response.data;

            localStorage.setItem('@CombatLan:token', token);
            localStorage.setItem('@CombatLan:user', JSON.stringify(userData));

            if (login) {
                login(userData);
            } else {
                console.error("A função login não existe no Contexto!");
            }

            alert('Login realizado com sucesso!');
            navigate('/');
        } catch (error) {
            console.error(error);
            alert('Usuário ou senha incorretos.');
        }
    }

    return (
        <>
            <div className="flex flex-col items-center">
                {isLogged && user ? (
                    <div className="flex flex-col items-center gap-2">
                        <h1>Combat Lan House</h1>
                        <span>Bem-vindo, <strong>{user.nick}</strong>!</span>

                        {isAdmin && (
                            <p>Você está logado como <span className="text-orange-combat font-semibold">Administrador</span>.</p>
                        )}

                        <button onClick={logout} className="mt-5 py-2.5 px-10 bg-orange-combat border border-neutral-dark-grayish hover:bg-white hover:text-orange-combat duration-300 ease-in-out transition-all cursor-pointer">Sair</button>
                    </div>
                ) : (
                    <form onSubmit={handleLogin} id="submit" action="post" className="flex flex-col items-center">
                        <input onChange={e => setNick(e.target.value)} id="nick" type="text" value={nick} className="w-75 p-2.5 mb-2.5 bg-neutral-very-light-grayish border border-neutral-dark-grayish" placeholder="Digite seu usuário" />

                        <input onChange={e => setSenha(e.target.value)} id="senha" type="password" value={senha} className="w-75 p-2.5 bg-neutral-very-light-grayish border border-neutral-dark-grayish" placeholder="Digite sua senha" />

                        <button type="submit" className="mt-5 py-2.5 px-10 bg-orange-combat border border-neutral-dark-grayish hover:bg-white hover:text-orange-combat duration-300 ease-in-out transition-all cursor-pointer">Enviar</button>
                    </form>
                )}

            </div>

        </>

    )
}