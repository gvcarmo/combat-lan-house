import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../server.js'
import { verificarToken } from '../middlewares/auth.js';

export const loginUsuario = async (req: Request, res: Response) => {
    const { nick, senha } = req.body;


    try {
        const usuario = await prisma.usuario.findUnique({ where: { nick } });

        if (!usuario) {
            return res.status(401).json({ error: "Usuário ou senha inválidos." });
        }

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (!senhaCorreta) {
            return res.status(401).json({ error: "Usuário ou senha inválidos." });
        }

        const token = jwt.sign(
            { id: usuario.id, nivel: usuario.nivel_acesso },
            process.env.JWT_SECRET as string,
            { expiresIn: '4h' }
        );

        console.log(token)

        const refreshToken = jwt.sign(
            { id: usuario.id },
            process.env.JWT_REFRESH_SECRET as string,
            { expiresIn: '7d' }
        )

        await prisma.usuario.update({
            where: { id: usuario.id },
            data: { refreshToken: refreshToken }
        })

        return res.json({
            token,
            refreshToken,
            user: { nick: usuario.nick, nivel: usuario.nivel_acesso }
        });
    } catch (error) {
        console.log("ERRO REAL:", error);
        return res.status(500).json({ error: "Erro ao fazer login" });
    }
};

export const refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ error: "Refresh token é obrigatório." });
    }

    try {
        const decodificado = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as any;

        const usuario = await prisma.usuario.findFirst({
            where: { id: decodificado.id, refreshToken: refreshToken }
        });

        if (!usuario) {
            return res.status(401).json({ error: "Refresh token inválido." });
        }

        const novoToken = jwt.sign(
            { id: usuario.id, nivel: usuario.nivel_acesso },
            process.env.JWT_SECRET as string,
            { expiresIn: '4h' }
        );

        return res.json({ token: novoToken });
    } catch (err: any) {
        console.error("Erro ao validar refresh token:", err.message);
        return res.status(401).json({ error: "Sessão expirada. Faça login novamente." });
    }
}