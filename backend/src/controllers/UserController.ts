import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../server.js'
import crypto from 'crypto';
import { transport } from '../services/mail.js';

export class UserController {
    async registrarUsuario(req: Request, res: Response) {
        const { nick, nome_completo, email, senha } = req.body || {};

        if (!nick) {
            return res.status(400).json({ error: "O campo nick é obrigatório" });
        }

        try {
            const usuarioExiste = await prisma.usuario.findUnique({ where: { nick: nick } });

            if (usuarioExiste) {
                return res.status(400).json({ error: "Este usuario já está em uso." })
            }

            const emailExiste = await prisma.usuario.findUnique({ where: { email: email } });

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

    async list(req: Request, res: Response) {
        try {
            const users = await prisma.usuario.findMany(); // ou prisma.usuario
            return res.json(users);
        } catch (error) {
            return res.status(500).json({ error: "Erro ao listar usuários" });
        }
    }

    async showMe(req: any, res: Response) {
        const userId = req.user.id;
        const user = await prisma.usuario.findUnique({ where: { id: userId } });
        return res.json(user);
    }

    async forgotPassword(req: Request, res: Response) {
        const { email } = req.body;

        try {
            const user = await prisma.usuario.findUnique({ where: { email } });

            if (!user) {
                return res.status(404).json({ error: "E-mail não encontrado." });
            }

            const token = crypto.randomBytes(20).toString('hex');
            const expires = new Date();
            expires.setHours(expires.getHours() + 1);

            await prisma.usuario.update({
                where: { id: user.id },
                data: {
                    passwordResetToken: token,
                    passwordResetExpires: expires
                }
            });

            await transport.sendMail({
                from: 'Combat Lan House <noreply@combatlanhouse.com.br>',
                to: email,
                subject: 'Recuperação de Senha',
                html: `
                    <div style="font-family: sans-serif;">
                        <h1>Recuperação de Senha - Combat Lan House</h1>
                        <p>Você solicitou a alteração de senha. Clique no link abaixo para prosseguir: </p>
                        <a href="http://localhost:5173/resetpassword/${token}">Resetar Senha</a>
                        <p>Este link expira em 1 hora.</p>
                    </div>
                `
            });

            return res.json({ message: "E-mail enviado com sucesso!" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Erro interno ao processar solicitação." });
        }
    }

    async resetPassword(req: Request, res: Response) {
        const { token } = req.params as any;
        const { novaSenha } = req.body;

        console.log("BODY:", req.body);
        console.log("PARAMS:", req.params);

        console.log("Token recebido:", token);

        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(novaSenha, salt);

        const user = await prisma.usuario.findFirst({
            where: {
                passwordResetToken: token,
                passwordResetExpires: { gt: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({ error: "Token inválido ou expirado" });
        }

        await prisma.usuario.update({
            where: { id: user.id },
            data: {
                senha: senhaHash,
                passwordResetToken: null,
                passwordResetExpires: null
            }
        });

        return res.json({ message: "Senha atualizada com sucesso!" })
    }
}