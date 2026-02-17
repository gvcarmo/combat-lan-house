import nodemailer from 'nodemailer';

export const transport = nodemailer.createTransport({
    host: "send.api.mailtrap.io",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendResetEmail = async (email: string, token: string) => {
    const link = `http://localhost:5173/reset-password/${token}`;

    await transport.sendMail({
        from: '"Combat Lan House" <combatlanhouseinformatica@gmail.com>',
        to: email,
        subject: "Recuperação de Senha",
        html: `
            <h1>Você solicitou a troca de senha</h1>
            <p>Clique no link abaixo para criar uma nova senha: </p>
            <a href="${link}">${link}</a>
            <p>Este link expira em 1 hora.</p>
        `
    });
};