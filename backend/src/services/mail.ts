import nodemailer from 'nodemailer';

export const transport = nodemailer.createTransport({
    host: "74.125.124.108",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    },
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 15000,
});

export const sendResetEmail = async (email: string, token: string) => {
    const link = `https://combat-lan-house.onrender.com/reset-password/${token}`;

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