import { createContext, useState, useEffect, type ReactNode } from 'react';

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
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState< User | null>(null);

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
    };

    const logout = () => {
        localStorage.removeItem('@CombatLan:token');
        localStorage.removeItem('@CombatLan:user');
        setUser(null);        
    }

    return (
        <AuthContext.Provider value={{ user, isLogged, isAdmin, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}