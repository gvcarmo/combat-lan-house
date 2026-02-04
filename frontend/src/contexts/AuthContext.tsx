import { createContext, useState, useEffect, type ReactNode } from 'react';
import { Loader } from '../components/loader/Loader';

interface User {
    id: number;
    nick: string;
    nivel: string;
}

interface AuthContextData {
    user: User | null;
    isLogged: boolean;
    isAdmin: boolean;
    login: (userData: User) => void;
    logout: () => void;
    globalLoading: boolean;
    setGlobalLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    const [globalLoading, setGlobalLoading] = useState(false);

    useEffect(() => {

        const storagedUser = localStorage.getItem('@CombatLan:user');

        if (storagedUser) {
            setUser(JSON.parse(storagedUser));
        }
    }, []);

    const isLogged = !!user;
    const isAdmin = user?.nivel === 'admin';

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
        <AuthContext.Provider value={{ user, isLogged, isAdmin, login, logout, globalLoading, setGlobalLoading }}>
            {globalLoading && <Loader />}
            {children}
        </AuthContext.Provider>
    )
}