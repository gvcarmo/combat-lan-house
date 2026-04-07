import { useParams, useSearchParams, Navigate, Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { FazerPedido } from './FazerPedido';
import { MeusPedidos } from './MeusPedidos';
import { UserInfos } from './UserInfos';
import { PedidosPendentes } from '../controlPanelAdmin/PedidosPendentes';
import { EnviarMensagem } from './EnviarMensagem';
import { Prazos } from '../../hooks/Prazos';
import { AdminChatDashboard } from '../chat/AdminChat';
import { ChatWidget } from '../chat/Chat';

export const ControlPanel = () => {
    const { nick } = useParams();
    const [searchParams] = useSearchParams();
    const { user, isAdmin, isLogged, checkingAuth, logout, limparNotificacoes, naoLidas } = useContext(AuthContext);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const [abaAtiva, setAbaAtiva] = useState(searchParams.get('aba') || 'fazer_pedido');

    const [abaAtivaAdmin, setAbaAtivaAdmin] = useState('pedidos_pendentes');

    if (checkingAuth) return <div className="text-white">Carregando...</div>

    if (!isLogged || user?.nick !== nick) {
        return <Navigate to="/" />;
    }

    const handleChatClick = () => {
        setIsChatOpen(prev => !prev);
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-linear-to-r from-[#FF3300] via-[#FF5900] to-[#803100]">
            {isAdmin ? (
                ''
            ) : (
                <div>
                    <button
                        onClick={handleChatClick}
                        className="fixed bottom-5 right-5 bg-orange-combat w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white text-2xl z-60"
                    >
                        {isChatOpen ? 'X' : '💬'}
                    </button>

                    <ChatWidget
                        externalOpen={isChatOpen}
                        setExternalOpen={setIsChatOpen}
                    />
                </div>
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
                                <p className="max-[610px]:text-[35px] max-[610px]:font-extralight">|</p>
                                <button className={`cursor-pointer transition-all hover:text-orange-combat transition-all" ${abaAtivaAdmin === 'mensagem_ativa' ? 'text-orange-combat' : ''}`}
                                    onClick={() => setAbaAtivaAdmin('mensagem_ativa')}>Msg Ativa</button>
                                <p className="max-[610px]:text-[35px] max-[610px]:font-extralight">|</p>
                                <button className={`cursor-pointer transition-all hover:text-orange-combat transition-all" ${abaAtivaAdmin === 'ticket' ? 'text-orange-combat' : ''}`}
                                    onClick={() => setAbaAtivaAdmin('ticket')}>Tickets</button>
                                <p className="max-[610px]:text-[35px] max-[610px]:font-extralight">|</p>
                                <button
                                    className={`cursor-pointer transition-all hover:text-orange-combat relative ${abaAtivaAdmin === 'chat' ? 'text-orange-combat' : ''}`}
                                    onClick={() => {
                                        setAbaAtivaAdmin('chat');
                                        limparNotificacoes();
                                    }}
                                >
                                    Chat
                                    {naoLidas > 0 && (
                                        <span className="absolute -top-3 -right-4 bg-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce shadow-lg">
                                            {naoLidas}
                                        </span>
                                    )}
                                </button>
                            </div>
                            <div>
                                {abaAtivaAdmin === 'pedidos_pendentes' && <PedidosPendentes />}
                                {abaAtivaAdmin === 'mensagem_ativa' && <Prazos />}
                                {abaAtivaAdmin === 'ticket' && <EnviarMensagem />}
                                {abaAtivaAdmin === 'chat' && <AdminChatDashboard />
                                }

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
                                <button className={`cursor-pointer transition-all hover:text-orange-combat transition-all" ${abaAtiva === 'ticket' ? 'text-orange-combat' : ''}`}
                                    onClick={() => setAbaAtiva('ticket')}>Abrir Ticket</button>

                            </div>
                            <div>
                                {abaAtiva === 'fazer_pedido' && <FazerPedido id={0} />}
                                {abaAtiva === 'meus_pedidos' && <MeusPedidos />}
                                {abaAtiva === 'infos_usuario' && <UserInfos />}
                                {abaAtiva === 'ticket' && <EnviarMensagem />}
                                {abaAtiva === 'chat' && <ChatWidget />}
                            </div>
                        </div>
                    )}

                </div>

                <div className="flex items-center justify-center">
                    <div className="text-white flex items-center mb-2 p-2">
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