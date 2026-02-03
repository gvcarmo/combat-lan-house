import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../server.js'

export const registrarUsuario = async (req: Request, res: Response) => {
    const { nick, nome_completo, email, senha, nivel_acesso } = req.body

    try {
        const usuarioExiste = await prisma.usuario.findUnique({ where: { nick: nick } });

        if (usuarioExiste) {
            return res.status(400).json({ error: "Este usuario já está em uso." })
        }

        const emailExiste = await prisma.usuario.findUnique ({ where: { email: email } });

        if (emailExiste) {
            return res.status(400).json({ error: "Este email já está em uso." })
        }

        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        const novoUsuario = await prisma.usuario.create({
            data: {
                nick,
                nome_completo,
                email,
                senha: senhaHash,
                nivel_acesso: 'user',
            },
            select: {
                id: true,
                nick: true,
                nome_completo: true,
                email: true,
                nivel_acesso: true
            }
        });
        return res.status(201).json(novoUsuario);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao cadastrar usuário." })
    }
};