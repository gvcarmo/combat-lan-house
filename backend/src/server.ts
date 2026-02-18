import 'dotenv/config'
import express from 'express';
import pg from 'pg'
import { PrismaClient } from '@prisma/client/index.js'
import { PrismaPg } from '@prisma/adapter-pg'
import routes from './routes/userRoutes.js';
import cors from 'cors';
import axios from 'axios';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter });
const httpServer = createServer(app);

app.use(cors({
    origin: '*',
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const io = new Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        methods: ["GET", "POST"]
    }
});

app.use((req: any, res, next) => {
    req.io = io;
    return next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(routes)
app.use('/uploads', express.static('uploads'));

httpServer.listen(3000, () => console.log("Servidor rodando com socket.io na porta 3000"));

const APP_URL = process.env.APP_URL

setInterval(async () => {
    if (APP_URL) {
        try {
            await axios.get(APP_URL);
            console.log('Ping efetuado para manter o servidor ativo!');
        } catch (error) {
            console.error('Erro no auto-ping:', error);
        }
    }
}, 840000)




export default prisma