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

    console.log("Editando ID:", id, "Body:", req.body, "File:", req.file?.path);

try {
        const idNumber = Number(id);
        if (isNaN(idNumber)) {
            return res.status(400).json({ message: "ID inválido" });
        }

        const postAtual = await prisma.post.findUnique({
            where: { id: idNumber }
        });

        if (!postAtual) {
            return res.status(404).json({ message: "Post não encontrado" });
        }

        let midiaFinal = postAtual.video_url;

        // Se houver novo arquivo (imagem/vídeo upload), usa o novo path do Cloudinary
        if (req.file) {
            midiaFinal = req.file.path;
        } 
        // Se for um link de vídeo manual (YouTube/etc)
        else if (video_url) {
            midiaFinal = video_url;
        }

        const postAtualizado = await prisma.post.update({
            where: { id: idNumber },
            data: {
                // Usamos o operador OR para manter o valor atual caso o novo venha vazio
                data: data || postAtual.data,
                descricao: descricao || postAtual.descricao,
                post_link: post_link || postAtual.post_link,
                video_url: midiaFinal
            }
        });

        return res.status(200).json(postAtualizado);
    } catch (error: any) {
        console.error("ERRO NO UPDATE:", error);
        return res.status(500).send({ 
            message: "Erro ao atualizar post.",
            error: error.message // Isso ajuda a debugar no Network do navegador
        });
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