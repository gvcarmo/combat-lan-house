import type { Request, Response } from 'express';
import prisma from '../server.js'

export const novoPost = async (req: Request, res: Response) => {
    try {
        const { data, video_url, descricao, post_link } = req.body;

        const midiaFinal = req.file ? req.file.path : (video_url || "");

        const postCriado = await prisma.post.create({
            data: {
                data: data || "",
                descricao: descricao || "",
                post_link: post_link || "",
                video_url: midiaFinal,
            }
        });
        return res.status(201).json(postCriado)
    } catch (error: any) {
        console.error("ERRO DETALHADO NO BACKEND:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
        return res.status(500).send({
            message: "Falha ao cadastrar um serviço.", debug: error.message
        })
    }
}

export const getPosts = async (req: Request, res: Response) => {
    try {
        const posts = await prisma.post.findMany({
            orderBy: { id: 'desc' }
        });
        return res.status(200).json(posts);
    } catch (error) {
        return res.status(500).json({ message: "Erro ao buscar posts." });
    }
};

export const editarPost = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { data, video_url, descricao, post_link } = req.body;

    try {
        const postAtual = await prisma.post.findUnique({
            where: { id: Number(id) }
        });

        if (!postAtual) {
            return res.status(404).json({ message: "Post não encontrado" });
        }

        let midiaFinal = postAtual.video_url;

        if (req.file) {
            midiaFinal = req.file.path;
        } else if (video_url !== undefined) {
            midiaFinal = video_url;
        }

        const postAtualizado = await prisma.post.update({
            where: { id: Number(id) },
            data: {
                data: data ?? postAtual.data,
                descricao: descricao ?? postAtual.descricao,
                post_link: post_link ?? postAtual.post_link,
                video_url: midiaFinal
            }
        });
        res.status(200).json(postAtualizado);
    } catch (error) {
        return res.status(500).send({ message: "Erro ao atualizar post." });
    }
}

export const deletarPost = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await prisma.post.delete({
            where: { id: Number(id) }
        });
        return res.status(200).json({ message: "Post deletado com sucesso!" });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao deletar post." })
    }
}