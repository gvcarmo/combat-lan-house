import type { Request, Response } from 'express';
import prisma from '../server.js'

export const listarServicos = async (req: Request, res: Response) => {
    try {
        const jobs = await prisma.job.findMany({
            orderBy: {
                ordem: 'asc'
            }
        });
        return res.status(200).json(jobs);
    } catch (error) {
        return res.status(500).send({ message: "Erro ao buscar serviços." });
    }
}

export const postarServico = async (req: Request, res: Response) => {
    const { nome, descricao, infos_uteis } = req.body;
    const icone = req.file ? req.file.path : "";

    try {
        const ultimoJob = await prisma.job.findFirst({
            orderBy: { ordem: 'desc' }
        });
        const proximaOrdem = ultimoJob ? ultimoJob.ordem + 1 : 1;
        const novoJob = await prisma.job.create({
            data: {
                nome: String(nome),
                descricao: String(descricao),
                infos_uteis: String(infos_uteis || ""),
                icone: icone,
                ordem: Number(proximaOrdem)
            }
        });

        return res.status(201).json(novoJob);

    } catch (error: any) {
        console.error("ERRO DETALHADO NO BACKEND:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
        return res.status(500).send({ message: "Falha ao cadastrar um serviço.", debug: error.message })
    }
};

export const editarServico = async (req: Request, res: Response) => {

        const { id } = req.params;
        const { nome, descricao, infos_uteis, ordem } = req.body

    try {
        const dadosParaAtualizar: any = {
            nome: nome,
            descricao: descricao,
            infos_uteis: infos_uteis || "",
        };

        if (ordem !== undefined && ordem !== null) {
            dadosParaAtualizar.ordem = Number(ordem);
        }

        if (req.file) {
            dadosParaAtualizar.icone = req.file.path;
        }

        const jobAtualizado = await prisma.job.update({
            where: { id: Number(id) },
            data: dadosParaAtualizar
        });
        res.status(200).json(jobAtualizado);
    } catch (error: any) {
        console.error("ERRO NO PRISMA:", error);
        return res.status(500).send({ message: "Erro ao atualizar o serviço." })
    }
};

export const deletarServico = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await prisma.job.delete({
            where: { id: Number(id) }
        });
        return res.status(200).send({ message: "Serviço removido com sucesso." });
    } catch (error) {
        return res.status(500).send({ message: "Erro ao remover o serviço." });
    }
};

export const trocarOrdem = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { direcao } = req.body; // 'subir' ou 'descer'

    try {
        const jobAtual = await prisma.job.findUnique({ where: { id: Number(id) } });
        if (!jobAtual) return res.status(404).send("Não encontrado");

        const vizinho = await prisma.job.findFirst({
            where: {
                ordem: direcao === 'subir' ? { lt: jobAtual.ordem } : { gt: jobAtual.ordem }
            },
            orderBy: {
                ordem: direcao === 'subir' ? 'desc' : 'asc'
            }
        });

        if (vizinho) {
            const ordemAtual = jobAtual.ordem;
            await prisma.job.update({ where: { id: jobAtual.id }, data: { ordem: vizinho.ordem } });
            await prisma.job.update({ where: { id: vizinho.id }, data: { ordem: ordemAtual } });
        }

        return res.status(200).send();
    } catch (error) {
        return res.status(500).send("Erro ao trocar ordem.");
    }
};