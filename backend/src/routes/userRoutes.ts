import { Router } from 'express'
import { registrarUsuario } from '../controllers/UserController.js';
import { loginUsuario } from '../controllers/AuthController.js';
import { somenteAdmin } from '../middlewares/auth.js';
import { deletarServico, editarServico, listarServicos, postarServico, trocarOrdem } from '../controllers/JobController.js';
import multer from 'multer';
import path from 'path';
import { deletarPost, editarPost, getPosts, novoPost } from '../controllers/PostController.js';
import { deletarReview, editReview, getReviews, novoReview } from '../controllers/ReviewController.js';

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import 'dotenv/config';

const routes = Router();

const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
const api_key = process.env.CLOUDINARY_API_KEY;
const api_secret = process.env.CLOUDINARY_API_SECRET;

if (!cloud_name || !api_key || !api_secret) {
    throw new Error("As credenciais do Cloudinary não foram encontradas no ambiente.");
}

cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: 'uploads',
            allowed_formats: ['jpg', 'png', 'jpeg', 'svg'],
            public_id: `file-${Date.now()}`
        };
    },
});

const upload = multer({ storage });


routes.post('/login', loginUsuario, somenteAdmin, postarServico);

routes.post('/usuarios', registrarUsuario);

routes.get('/posts', getPosts);
routes.post('/posts', upload.single('midia'), novoPost);
routes.put('/posts/:id', editarPost);
routes.delete('/posts/:id', deletarPost);

routes.get('/jobs', listarServicos);
routes.post('/jobs', upload.single('icone'), postarServico);
routes.put('/jobs/:id', upload.single('icone'), editarServico);
routes.patch('/jobs/:id/ordem', trocarOrdem);
routes.put('/jobs/:id', editarServico);
routes.delete('/jobs/:id', deletarServico);

routes.get('/reviews', getReviews);
routes.post('/reviews', upload.single('avatar'), novoReview);
routes.put('/reviews/:id', upload.single('avatar'), editReview);
routes.put('/reviews/:id', editReview);
routes.delete('/reviews/:id', deletarReview);

export default routes;