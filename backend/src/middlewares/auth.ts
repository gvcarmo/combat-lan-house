import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verificarToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) return res.status(401).json({ error: "Acesso negado. Você precisa estar logado."});

    try {
        const decodificado = jwt.verify(token, process.env.JWT_SECRET as string) as any;
        req.user = decodificado;
        next();
    } catch (err) {
        res.status(403).json({ error: "Token invalido ou expirado." });
    }
};

export const somenteAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.nivel_acesso !== 'admin') {
        return res.status(403).json({
            error: "Acesso restrito apenas para administradores."
        });
    }
    next();
}