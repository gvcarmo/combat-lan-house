import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../server.js'

export const loginUsuario = async (req: Request, res: Response) => {
    const { nick, senha } = req.body;

    try {
        const usuario = await prisma.usuario.findUnique({ where: { nick } });

        if (!usuario) {
            return res.status(401).json({ error: "Usuário ou senha inválidos."});
        }

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (!senhaCorreta) {
            return res.status(401).json({ error: "Usuário ou senha inválidos."});
        }

        const token = jwt.sign(
            { id: usuario.id, nivel: usuario.nivel_acesso },
            process.env.JWT_SECRET as string,
            { expiresIn: '8h' }
        );

        return res.json({
            token,
            user: { nick: usuario.nick, nivel: usuario.nivel_acesso }
        });
    } catch (error) {
        return res.status(500).json({ error: "Erro ao fazer login" });
    }
};