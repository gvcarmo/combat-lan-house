import { useParams, useSearchParams, Navigate, Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { FazerPedido } from './FazerPedido';
import { MeusPedidos } from './MeusPedidos';
import { UserInfos } from './UserInfos';
import { PedidosPendentes } from '../controlPanelAdmin/PedidosPendentes';
import { EnviarMensagem } from './EnviarMensagem';

export const ControlPanel = () => {
    const { nick } = useParams();
    const [searchParams] = useSearchParams();
    const { user, isAdmin, isLogged, checkingAuth, logout } = useContext(AuthContext);

    const [abaAtiva, setAbaAtiva] = useState(searchParams.get('aba') || 'fazer_pedido');

    const [abaAtivaAdmin, setAbaAtivaAdmin] = useState('pedidos_pendentes');

    if (checkingAuth) return <div className="text-white">Carregando...</div>

    if (!isLogged || user?.nick !== nick) {
        return <Navigate to="/" />;
    }

    return (
        <div className="min-h-screen flex justify-center items-center bg-linear-to-r from-[#FF3300] via-[#FF5900] to-[#803100]">
            {isAdmin ? (
                ''
            ) : (
                <button onClick={() => setAbaAtiva('chat')} className="fixed flex items-center justify-center z-50 bottom-8 right-8 w-20 h-20 rounded-full bg-neutral-dark-grayish border border-neutral-very-light-grayish cursor-pointer hover:scale-105 transition-all duration-300 ease-in-out max-[510px]:bottom-3 max-[510px]:right-3 max-[510px]:w-15 max-[510px]:h-15" >
                    <svg width="40" height="40" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.6023 8.525C18.6023 13.2331 14.4367 17.05 9.30228 17.05C8.009 17.05 6.77869 16.8078 5.65978 16.3719L1.70728 18.4644C1.25681 18.7017 0.704626 18.6194 0.341345 18.2609C-0.0219366 17.9025 -0.10428 17.3455 0.137907 16.895L1.86228 13.64C0.694938 12.2159 0.00228215 10.4431 0.00228215 8.525C0.00228215 3.81688 4.16791 0 9.30228 0C14.4367 0 18.6023 3.81688 18.6023 8.525ZM18.6023 26.35C14.0443 26.35 10.2517 23.342 9.45728 19.375C15.2698 19.3023 20.3218 15.1658 20.8788 9.55672C24.9137 10.4867 27.9023 13.8338 27.9023 17.825C27.9023 19.7431 27.2096 21.5159 26.0423 22.94L27.7667 26.195C28.004 26.6455 27.9217 27.1977 27.5632 27.5609C27.2048 27.9242 26.6478 28.0066 26.1973 27.7644L22.2448 25.6719C21.1259 26.1078 19.8956 26.35 18.6023 26.35Z" fill="white" />
                    </svg>
                </button>
            )}


            <div id="jobs" className="min-[1139px]:w-280 min-[610px]:w-139 min-[320px]:w-71 flex flex-col items-center py-2.5 bg-neutral-grayish border border-neutral-border-light-color text-white my-2.5">
                <div className="w-full flex justify-end gap-3 my-2.5 mr-15">
                    <Link to="/" className="hover:text-orange-combat transition-all">Início</Link>
                    <p>|</p>
                    <a className="cursor-pointer hover:text-orange-combat transition-all" onClick={logout}>Sair</a>
                </div>
                <div className="w-full max-w-275 bg-neutral-dark-grayish border border-gray-800 p-6 max-[610px]:p-2 flex flex-col gap-5">
                    <div>
                        <h1 className="text-center pb-5 text-[20px] font-semibold text-orange-combat">Painel de Controle</h1>
                        <div className="flex justify-center">
                            <p>Seja bem vindo(a) <strong>{user?.nick}</strong>!</p>
                        </div>
                    </div>

                    {isAdmin ? (
                        <div>
                            <div className="flex gap-3 max-[610px]:gap-2 max-[610px]:text-[14px] justify-end">
                                <button className={`cursor-pointer transition-all hover:text-orange-combat transition-all" ${abaAtivaAdmin === 'pedidos_pendentes' ? 'text-orange-combat' : ''}`}
                                    onClick={() => setAbaAtivaAdmin('pedidos_pendentes')}>Pedidos pendentes</button>
                                <p>|</p>
                                <button className={`cursor-pointer transition-all hover:text-orange-combat transition-all" ${abaAtivaAdmin === 'chat' ? 'text-orange-combat' : ''}`}
                                    onClick={() => setAbaAtivaAdmin('chat')}>Tickets</button>
                            </div>
                            <div>
                                {abaAtivaAdmin === 'pedidos_pendentes' && <PedidosPendentes />}
                                {abaAtivaAdmin === 'chat' && <EnviarMensagem />}

                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="flex gap-3 max-[610px]:gap-2 max-[610px]:text-[14px] justify-end max-[1139px]:items-center">
                                <button className={`cursor-pointer transition-all hover:text-orange-combat transition-all" ${abaAtiva === 'fazer_pedido' ? 'text-orange-combat' : ''}`}
                                    onClick={() => setAbaAtiva('fazer_pedido')}>Fazer um pedido</button>
                                <p className="max-[610px]:text-[35px] max-[610px]:font-extralight">|</p>
                                <button className={`cursor-pointer transition-all hover:text-orange-combat transition-all" ${abaAtiva === 'meus_pedidos' ? 'text-orange-combat' : ''}`}
                                    onClick={() => setAbaAtiva('meus_pedidos')}>Meus pedidos</button>
                                <p className="max-[610px]:text-[35px] max-[610px]:font-extralight">|</p>
                                <button className={`cursor-pointer transition-all hover:text-orange-combat transition-all" ${abaAtiva === 'infos_usuario' ? 'text-orange-combat' : ''}`}
                                    onClick={() => setAbaAtiva('infos_usuario')}>Minha Conta</button>
                                <p className="max-[610px]:text-[35px] max-[610px]:font-extralight">|</p>
                                <button className={`cursor-pointer transition-all hover:text-orange-combat transition-all" ${abaAtiva === 'chat' ? 'text-orange-combat' : ''}`}
                                    onClick={() => setAbaAtiva('chat')}>Abrir Ticket</button>

                            </div>
                            <div>
                                {abaAtiva === 'fazer_pedido' && <FazerPedido />}
                                {abaAtiva === 'meus_pedidos' && <MeusPedidos />}
                                {abaAtiva === 'infos_usuario' && <UserInfos />}
                                {abaAtiva === 'chat' && <EnviarMensagem />}
                            </div>
                        </div>
                    )}

                </div>

                <div className="flex items-center justify-center">
                    <div className="text-white flex items-center mb-2">
                        <Link to="/">
                            <img className="w-13 hover:scale-105 transition-all uration-300 ease-in-out" src="./logo-c.svg" alt="Logo Combat Lan House - C" />
                        </Link>
                        <p className="pt-4.5 pl-5 text-sm">Copyright © <span className="text-orange-combat">Combat Lan House</span><br /> Todos os direitos e conteúdos reservado<br /> à marca Combat e a seus respectivos donos.</p>
                    </div>
                </div>

            </div>
        </div>
    )
}