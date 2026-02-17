import { Request, Response } from 'express';
import prisma from "../server.js";

import { MercadoPagoConfig, Payment } from 'mercadopago';
import { v4 as uuidv4 } from 'uuid';

import { v2 as cloudinary } from 'cloudinary';

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACESS_TOKEN || ''
});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET as string
});

const payment = new Payment(client);

export class AskController {
    async StorageEvent(req: any, res: Response) {
        try {
            const { jobSlug, dadosForm, arquivosEnviados } = req.body;
            const usuarioId = req.user.id;

            const jobs = await prisma.job.findMany();

            const job = jobs.find(j => {
                const nomeNormalizado = j.nome
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .toLowerCase()
                    .replace(/\s+/g, '-');

                return nomeNormalizado === jobSlug.toLowerCase();
            });

            if (!job) {
                return res.status(404).json({ error: "Serviço não encontrado." });
            }

            const novoPedido = await prisma.pedido.create({
                data: {
                    usuarioId: usuarioId,
                    jobId: job.id,
                    dadosForm: JSON.stringify(dadosForm),
                    arquivosEnviados: arquivosEnviados || [],
                    arquivosFinal: [],
                    status: 'aguardando pagamento'
                }
            });
            return res.status(201).json(novoPedido);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Erro interno ao processar pedido." })
        }
    }

    async updateOrder(req: any, res: Response) {
        const { id } = req.params;
        const { dadosForm } = req.body;
        const usuarioId = Number(req.user.id);
        const nivelAcesso = String(req.user.nivel).toLowerCase().trim();

        try {
            const pedido = await prisma.pedido.findUnique({
                where: { id: Number(id) }
            });

            if (!pedido) {
                return res.status(404).json({ error: "Pedido não encontrado." });
            }

            const ehAdmin = nivelAcesso === 'admin';
            const ehDono = Number(pedido.usuarioId) === usuarioId;

            if (!ehAdmin && !ehDono) {
                return res.status(403).json({ error: "Sem permissão para editar este pedido." });
            }

            if (!ehAdmin && ehDono) {
                if (pedido.status !== "aguardando pagamento") {
                    return res.status(400).json({ error: "O pedido já está em processamento e não pode ser alterado." });
                }
            }

            const novosArquivos = req.files ? (req.files as any[]).map(f => f.path) : [];

            const dadosParaAtualizar: any = {};

            if (dadosForm) {
                dadosParaAtualizar.dadosForm = typeof dadosForm === 'string' ? dadosForm : JSON.stringify(dadosForm);
            }

            if (novosArquivos.length > 0) {
                dadosParaAtualizar.arquivosFinal = novosArquivos;
                if (ehAdmin) {
                    dadosParaAtualizar.status = "finalizado";
                }
            }

            const pedidoAtualizado = await prisma.pedido.update({
                where: { id: Number(id) },
                data: dadosParaAtualizar
            });

            return res.json(pedidoAtualizado);

        } catch (error) {
            console.error("Erro ao atualizar pedido:", error);
            return res.status(500).json({ error: "Erro interno ao salvar alterações." });
        }
    }

    async showOrder(req: any, res: Response) {
        const { id } = req.params;
        const usuarioLogadoId = Number(req.user.id);
        const nivelAcesso = String(req.user.nivel).trim().toLowerCase();

        const pedido = await prisma.pedido.findUnique({
            where: { id: Number(id) },
        });

        if (!pedido) return res.status(404).json({ error: "Não encontrado" });
        const ehAdmin = nivelAcesso === 'admin';
        const ehDono = Number(pedido.usuarioId) === usuarioLogadoId;

        if (ehAdmin || ehDono) {
            const pedidoCompleto = await prisma.pedido.findUnique({
                where: { id: Number(id) },
                include: { job: true, usuario: true }
            });
            return res.json(pedidoCompleto);
        }

        return res.status(403).json({ error: "Acesso negado. Você não tem permissão para ver este pedido." });

    }

    async listMyOrders(req: any, res: Response) {
        const idDoUsuarioLogado = req.user.id;

        try {
            const pedidos = await prisma.pedido.findMany({
                where: {
                    usuarioId: idDoUsuarioLogado
                },
                include: {
                    job: true
                },
                orderBy: {
                    criadoEm: 'desc'
                }
            });

            return res.json(pedidos);
        } catch (error) {
            console.error("Erro ao buscar pedidos:", error);
            return res.status(500).json({ error: "Não foi possível carregar seus pedidos." });
        }
    }

    async deleteOrder(req: any, res: Response) {
        const { id } = req.params;
        const usuarioId = req.user.id;

        try {
            const pedido = await prisma.pedido.findUnique({
                where: { id: Number(id) }
            });

            if (!pedido) {
                return res.status(404).json({ error: "Pedido não encontrado." })
            }

            if (pedido.usuarioId !== usuarioId) {
                return res.status(403).json({ error: "Não autorizado." });
            }

            if (pedido.status !== "aguardando pagamento") {
                return res.status(400).json({
                    error: "Este pedido já está em processamento e não pode ser deletado."
                });
            }

            await prisma.pedido.delete({
                where: { id: Number(id) }
            });

            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: "Erro ao deletar pedido." });
        }
    }

    async generatePix(req: Request, res: Response) {

        const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACESS_TOKEN! });
        const payment = new Payment(client);

        const { pedidoId } = req.body;

        try {
            const pedido = await prisma.pedido.findUnique({
                where: { id: Number(pedidoId) },
                include: { job: true, usuario: true }
            });

            if (!pedido) return res.status(404).json({ error: "Pedido não encontrado" });

            console.log("DEBUG: Pedido encontrado, jobId é:", pedido.jobId);
            console.log("DEBUG: Objeto Job vinculado:", pedido.job);

            if (!pedido.job) {
                return res.status(400).json({
                    error: "Este pedido não possui um serviço vinculado ou o serviço foi removido."
                });
            }

            const precoRaw = pedido.job.preco || "0";

            // Remove R$, espaços e troca vírgula por ponto
            const valorLimpo = precoRaw
                .replace('R$', '')
                .replace(/\s/g, '')
                .replace(',', '.');

            const valorFinal = parseFloat(valorLimpo);

            // Se o parseFloat falhar, o valorFinal será NaN
            if (isNaN(valorFinal) || valorFinal <= 0) {
                return res.status(400).json({ error: `O preço '${precoRaw}' não pôde ser convertido para número.` });
            }

            const paymentData = {
                body: {
                    transaction_amount: valorFinal,
                    description: `Serviço: ${pedido.job.nome}`,
                    payment_method_id: 'pix',
                    external_reference: String(pedido.id),
                    notification_url: "https://www.combatlanhouse.com.br/webhook-pix",
                    payer: {
                        email: pedido.usuario.email,
                        first_name: pedido.usuario.nome_completo.split(' ')[0] || "Cliente",
                        identification: {
                            type: 'CPF',
                            number: '00000000000'
                        }
                    },
                },
                requestOptions: { idempotencyKey: uuidv4() }
            };

            const result = await payment.create(paymentData);

            return res.json({
                qr_code: result.point_of_interaction?.transaction_data?.qr_code,
                qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64
            });
        } catch (error) {
            console.error("ERRO COMPLETO:", error);
            return res.status(500).json({ error: "Erro ao gerar PIX" });
        }
    }

    async handleWebhook(req: Request, res: Response) {
        const { action, data, type } = req.body;

        if (action?.includes("payment") || type === "payment") {
            try {
                const paymentId = data?.id || req.body.resource?.split('/').pop();

                if(!paymentId) return res.status(200).send()

                await new Promise(resolve => setTimeout(resolve, 2000));

                console.log("Recebi notificação do pagamento:", paymentId);

                const paymentInfo = await payment.get({ id: String(paymentId) });
                const status = paymentInfo.status;
                const pedidoId = paymentInfo.external_reference;

                console.log(`Pagamento ${paymentId} do pedido ${pedidoId} está: ${status}`);

                if (status === "approved") {
                    await prisma.pedido.updateMany({
                        where: {
                            id: Number(pedidoId)
                        },
                        data: {
                            status: "pendente"
                        }
                    });

                    console.log(`Pedido atualizado com sucesso!`);
                }
            } catch (error) {
                console.error("Erro no Webhook:", error);
            }
        }
        return res.status(200).send();
    }

    async checkStatus(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const pedido = await prisma.pedido.findUnique({
                where: { id: Number(id) },
                select: { status: true }
            });
            return res.json(pedido);
        } catch (error) {
            return res.status(500).json({ error: "Erro ao consultar status." });
        }
    }

    async pedidosPendentes(req: Request, res: Response) {
        try {
            const pedido = await prisma.pedido.findMany({
                where: {
                    status: {
                        contains: "pendente"
                    },
                },
                include: {
                    usuario: true,
                    job: true
                },
                orderBy: {
                    criadoEm: 'asc',
                }
            });

            return res.json(pedido);
        } catch (error) {
            return res.status(500).json({ error: "Erro ao retornar os pedidos." });
        }
    }

    async downloadFile(req: any, res: Response) {
        const { id } = req.params;

        try {
            const pedido = await prisma.pedido.findUnique({
                where: { id: Number(id) },
            });

            if (!pedido) return res.status(404).json({ error: "Pedido não encontrado" });

            const rawData: any = pedido.arquivosFinal;
            const arquivos = Array.isArray(rawData) ? rawData : rawData?.set || [];
            const fileUrl = arquivos[0];

            if (!fileUrl) return res.status(404).json({ error: "URL não encontrada" });

            if (!arquivos || arquivos.length === 0) {
                return res.status(404).json({ error: "Nenhum arquivo anexado." });
            }

            if (pedido.usuarioId !== req.user.id && req.user.nivel_acesso !== 'admin') {
                return res.status(403).json({ error: "Este pedido não pertence a você." });
            }

            const match = fileUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z]+)?$/);
            const publicId = match ? match[1] : '';

            if (!match) return res.status(400).json({ error: "Formato de URL inválido" });

            const signedUrl = cloudinary.utils.private_download_url(publicId, 'pdf', {
                resource_type: 'image',
                type: 'upload',
                attachment: true, // Força o download
                expires_at: Math.floor(Date.now() / 1000) + 3600 // Expira em 1h
            });

            console.log("Link gerado com sucesso!");

            return res.status(200).json({ url: signedUrl});

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Erro ao processar download." });
        }
    }

}