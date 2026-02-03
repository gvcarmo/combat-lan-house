import type { Request, Response } from 'express';
import prisma from '../server.js'

export const novoReview = async (req: Request, res: Response) => {
    try {
        const { nome, stars, descricao } = req.body;

        const reviewCriado = await prisma.review.create({
            data: {
                nome: nome || "Anônimo",
                stars: Number(stars) || 5,
                descricao: descricao || "",
                avatar: req.file ? req.file.filename : ""
            }
        });
        return res.status(201).json(reviewCriado)
    } catch (error) {
        return res.status(500).send({ message: "Falha ao cadastrar um post." })
    }
}

export const getReviews = async (req: Request, res: Response) => {
    try {
        const reviews = await prisma.review.findMany({
            orderBy: { id: 'desc' }
        });
        return res.status(200).json(reviews);
    } catch (error) {
        return res.status(500).json({ message: "Erro ao buscar Avaliações." });
    }
};

export const editReview = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nome, stars, descricao, avatar } = req.body;

    try {
        const reviewAtual = await prisma.review.findUnique({
            where: { id: Number(id) }
        });

        if (!reviewAtual) {
            return res.status(404).json({ message: "Avaliação não encontrada." });
        }

        if (req.file) {
            reviewAtual.avatar = req.file.filename;
        } else if (avatar !== undefined) {
            reviewAtual.avatar = avatar;
        }

        const reviewAtualizado = await prisma.review.update({
            where: { id: Number(id) },
            data: {
                nome: nome || reviewAtual.nome,
                stars: stars ? Number(stars) : reviewAtual.stars,
                descricao: descricao || reviewAtual.descricao,
                avatar: reviewAtual.avatar
            }
        });
        res.status(200).json(reviewAtualizado);
    } catch (error) {
        return res.status(500).send({ message: "Erro ao atualizar avaliação." });
    }

}

export const deletarReview = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await prisma.review.delete({
            where: { id: Number(id) }
        });
        return res.status(200).json({ message: "Avaliação deletada com sucesso!" });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao deletar Avaliação." })
    }
}