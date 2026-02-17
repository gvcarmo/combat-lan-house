import 'dotenv/config'
import express from 'express';
import pg from 'pg'
import { PrismaClient } from '@prisma/client/index.js'
import { PrismaPg } from '@prisma/adapter-pg'
import routes from './routes/userRoutes.js';
import cors from 'cors';
import axios from 'axios';

const port = 3000
const app = express();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter });

app.use(cors({
    origin: '*',
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true}))
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



export default prisma