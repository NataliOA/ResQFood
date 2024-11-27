import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import connectDB from './config/db.js';
import whatsappController from './controllers/whatsappController.js';
import mongoose from 'mongoose';

const { urlencoded } = bodyParser;
const app = express();
app.use(urlencoded({ extended: true }));

// Conectar a la base de datos
connectDB();
mongoose.set('debug', true);


// Ruta para recibir mensajes de WhatsApp
app.post('/whatsapp', whatsappController);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
