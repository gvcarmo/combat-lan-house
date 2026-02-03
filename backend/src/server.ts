import express from 'express';
import 'dotenv/config'
import pg from 'pg'
import { PrismaClient } from '@prisma/client/index.js'
import { PrismaPg } from '@prisma/adapter-pg'
import routes from './routes/userRoutes.js';
import cors from 'cors';
import path from 'path';
import axios from 'axios';

const port = 3000
const app = express();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter });

app.use(cors());
app.use(express.json());
app.use(routes)
app.use('/uploads', express.static('uploads'));

app.listen(port, () => {
    console.log("Servidor rodando na porta 3000")
})

const APP_URL = process.env.APP_URL

setInterval(async () => {
    if(APP_URL) {
        try {
            await axios.get(APP_URL);
            console.log('Ping efetuado para manter o servidor ativo!');
        } catch (error) {
            console.error('Erro no auto-ping:', error);
        }
    }
}, 840000)

app.use((err: any, req: any, res: any, next: any) => {
  console.error("🔥 ERRO DO MIDDLEWARE:");
  console.error("Mensagem:", err.message);
  console.error("Stack:", err.stack);

  res.status(500).json({
    message: "Erro interno no servidor",
    error: err.message, // Isso vai aparecer no seu navegador agora!
    stack: err.stack
  });
});

export default prisma