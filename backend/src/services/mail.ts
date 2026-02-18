import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendResetEmail = async (email: string, token: string) => {
    const link = `https://www.combatlanhouse.com.br/reset-password/${token}`;

    try {
        const { data, error } = await resend.emails.send({
            from: 'Combat Lan House <onboarding@resend.dev>',
            to: email,
            subject: 'Recuperação de Senha',
            html: `
                <div style="font-family: sans-serif;">
                    <h1>Troca de Senha - Combat Lan House</h1>
                    <p>Você solicitou a alteração de senha. Clique no link abaixo:</p>
                    <a href="${link}" style="background: #ff6600; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                        Resetar Senha
                    </a>
                    <p>Se você não solicitou isso, ignore este e-mail.</p>
                </div>
            `,
        });

        if (error) {
            console.error("Erro no Resend:", error);
            throw new Error("Falha ao enviar e-mail");
        }

        console.log("E-mail enviado via Resend!", data?.id);
    } catch (err) {
        console.error("Erro inesperado:", err);
        throw err;
    }
};