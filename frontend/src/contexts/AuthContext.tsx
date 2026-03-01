import { createContext, useState, useEffect, type ReactNode, useRef } from 'react';
import { Loader } from '../components/loader/Loader';
import { io } from 'socket.io-client';

export interface User {
    id: number;
    nick: string;
    nivel: string;
    nome_completo?: string;
}

export interface MessageContent {
    autor: 'user' | 'admin';
    mensagem: string;
    data: string;
    nome: string;
    criadoEm: string;
    isArquivo?: boolean;
    tipoArquivo?: 'image' | 'document';
}

export interface Chat {
    id: number;
    assunto: string;
    status: string;
    mensagem: MessageContent[];
    usuarioId: number;
    usuario: {
        id: number;
        nome_completo: string;
        email: string;
    };
    atualizadoEm: string;
}

interface AuthContextData {
    user: User | null;
    isLogged: boolean;
    isAdmin: boolean;
    login: (userData: User) => void;
    logout: () => void;
    globalLoading: boolean;
    setGlobalLoading: React.Dispatch<React.SetStateAction<boolean>>;
    checkingAuth: boolean;
    socket: any;
    chats: Chat[];
    setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
    naoLidas: number;
    limparNotificacoes: () => void;
}

const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
    transports: ['websocket'],
    autoConnect: true,
    withCredentials: true,
    reconnection: true
});

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [globalLoading, setGlobalLoading] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [chats, setChats] = useState<Chat[]>([]);
    const setChatsRef = useRef(setChats);
    const [naoLidas, setNaoLidas] = useState<number>(0);

    const limparNotificacoes = () => setNaoLidas(0);

    useEffect(() => {

        const storagedUser = localStorage.getItem('@CombatLan:user');

        if (storagedUser) {
            setUser(JSON.parse(storagedUser));
        }
        setCheckingAuth(false);
    }, []);

    const isLogged = !!user;
    const isAdmin = user?.nivel === 'admin';

    useEffect(() => {
        setChatsRef.current = setChats;
    }, [chats]);

    useEffect(() => {
        const handleNovaMensagem = (data: Chat) => {
            if (isAdmin) {
                setChats((prev) => {
                    const filtrados = prev.filter(c => c.id !== data.id);
                    return [data, ...filtrados];
                });

                const ultimaMsg = data.mensagem[data.mensagem.length - 1];
                if (ultimaMsg?.autor === 'user') {
                    setNaoLidas(prev => prev + 1);
                    new Audio('/notificacao.mp3').play().catch(() => { });
                }
            }
        }

        socketInstance.on('nova_mensagem_chat', handleNovaMensagem);

        return () => {
            // Se esse log aparecer ao trocar de aba, o isAdmin mudou para false ou o Provider resetou
            socketInstance.off('nova_mensagem_chat', handleNovaMensagem);
        };
    }, [isAdmin]);

    useEffect(() => {
        // Função que realmente envia o sinal
        const anunciarAdmin = () => {
            // Mudamos o teste: se for admin e houver um usuário (independente de ter .id)
            if (isAdmin && user && socketInstance.connected) {

                // Enviamos o nick já que o id não apareceu no seu log
                socketInstance.emit('admin_entrou', user.nick);
            }
        };

        // Executa ao montar/atualizar
        anunciarAdmin();

        // Garante que envie se a conexão cair e voltar
        socketInstance.on('connect', anunciarAdmin);

        return () => {
            socketInstance.off('connect', anunciarAdmin);
        };
    }, [isAdmin, user]);

    const login = (userData: User) => {
        setUser(userData);

        localStorage.setItem('@CombatLan:user', JSON.stringify(userData));
    };

    const logout = () => {
        localStorage.removeItem('@CombatLan:token');
        localStorage.removeItem('@CombatLan:user');
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, isLogged, isAdmin, login, logout, globalLoading, setGlobalLoading, checkingAuth, chats, setChats, socket: socketInstance, naoLidas, limparNotificacoes }}>
            {globalLoading && <Loader />}
            {children}
        </AuthContext.Provider>
    )
}