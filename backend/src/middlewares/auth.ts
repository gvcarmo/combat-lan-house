import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verificarToken = (req: Request, res: Response, next: NextFunction) => {
    let token = req.headers.authorization?.split(' ')[1] || req.query.token as string;

    if (!token) {
        return res.status(401).json({ error: "Acesso negado. Sessão não encontrada." });
    }

    try {
        const decodificado = jwt.verify(token, process.env.JWT_SECRET as string) as any;
        req.user = decodificado;
        next();
    } catch (err: any) {
        console.error("Erro na validação do JWT:", err.message);

        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: "Sessão expirada.",
                code: "TOKEN_EXPIRED"
            });
        }
        return res.status(401).json({ error: "Token inválido." });
    }
};

export const somenteAdmin = (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || req.user.nivel !== 'admin') {
        return res.status(403).json({
            error: "Acesso restrito apenas para administradores."
        });
    }
    next();
}