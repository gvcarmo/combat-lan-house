import { Router } from 'express'
import { loginUsuario, refreshToken } from '../controllers/AuthController.js';
import { somenteAdmin, verificarToken } from '../middlewares/auth.js';
import { deletarServico, editarServico, listarServicos, postarServico, trocarOrdem } from '../controllers/JobController.js';
import multer from 'multer';
import { deletarPost, editarPost, getPosts, novoPost } from '../controllers/PostController.js';
import { deletarReview, editReview, getReviews, novoReview } from '../controllers/ReviewController.js';

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import 'dotenv/config';

import { UserController } from '../controllers/UserController.js';
import { AskController } from '../controllers/AskController.js';
import { MessageController } from '../controllers/MessageController.js';

const routes = Router();

const userController = new UserController();
const askController = new AskController();
const messageController = new MessageController();

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
            resource_type: 'auto',
            allowed_formats: ['jpg', 'png', 'jpeg', 'svg', 'pdf', 'doc', 'docx', 'txt'],
            public_id: `file-${Date.now()}`
        };
    },
});

const upload = multer({ storage });

routes.post('/webhook-pix', askController.handleWebhook);

routes.post('/resetpassword/:token', userController.resetPassword);
routes.post('/forgotpassword', userController.forgotPassword);

routes.post('/login', loginUsuario, somenteAdmin, postarServico);
routes.post('/refresh-token', refreshToken);

routes.post('/usuarios', userController.registrarUsuario);
routes.get('/usuarios', userController.list);
routes.get('/usuarios', userController.showMe);
routes.get('/usuarios', userController.registrarUsuario);

routes.get('/posts', getPosts);
routes.post('/posts', upload.single('midia'), novoPost);
routes.put('/posts/:id', upload.single('midia'), editarPost);
routes.put('/posts/:id', editarPost);
routes.delete('/posts/:id', deletarPost);

routes.get('/jobs', listarServicos);
routes.post('/jobs', upload.single('icone'), postarServico);
routes.put('/jobs/:id', upload.single('icone'), editarServico);
routes.patch('/jobs/:id/ordem', trocarOrdem);
routes.put('/jobs/:id', editarServico);
routes.delete('/jobs/:id', deletarServico);

routes.get('/reviews', getReviews);
routes.post('/reviews', upload.single('midia'), novoReview);
routes.put('/reviews/:id', upload.single('midia'), editReview);
routes.put('/reviews/:id', editReview);
routes.delete('/reviews/:id', deletarReview);

routes.post('/pedidos', verificarToken, askController.StorageEvent);
routes.delete('/pedidos/:id', verificarToken, askController.deleteOrder);
routes.get('/pedido/status/:id', askController.checkStatus);
routes.post('/meus-pedidos', verificarToken, askController.listMyOrders);
routes.get('/meus-pedidos', verificarToken, askController.listMyOrders);
routes.get('/pedido/:id/download', verificarToken, askController.downloadFile);
routes.get('/pedido/:id', verificarToken, askController.showOrder)
routes.put('/pedido/:id', verificarToken, askController.updateOrder)
routes.post('/pedido/:id', verificarToken, upload.array('arquivosFinal'), askController.updateOrder);
routes.post('/pedidos', verificarToken, upload.array('arquivosEnviados'), askController.StorageEvent);
routes.get('/pedidos', verificarToken, askController.pedidosPendentes)

routes.get('/admin/pedidos', verificarToken, somenteAdmin, askController.index)
routes.patch('/admin/pedido/:id/status', verificarToken, somenteAdmin, askController.updateStatus)

routes.post('/gerar-pix', verificarToken, (req, res) => askController.generatePix(req, res));
routes.post('/webhooks/mercadopago', askController.handleWebhook);

routes.get('/messages', verificarToken, messageController.listMyMessages);
routes.get('/messages/:id', verificarToken, messageController.getMessageById);
routes.post('/messages', verificarToken, upload.array('enviarArquivo'), messageController.sendMessage);
routes.post('/messages/:id/reply', verificarToken, messageController.replyMessage);
routes.delete('/message/:id', verificarToken, messageController.deleteMessage);

routes.patch('/messages/:id/close', verificarToken, messageController.closeMessage);
routes.patch('/messages/:id/reopen', verificarToken, messageController.reabrirTicket);

export default routes;