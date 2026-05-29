const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes'); 

const helmet = require('helmet');
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(helmet());

app.use('/api/auth', authRoutes); 
app.get('/api/auth/test-directo', (req, res) => {
    res.json({ mensaje: "¡Express sí lee este index.js real!" });
});
// Ruta de prueba de respuesta
app.get('/', (req, res) => {
    res.send('Servidor conectado');
});

// Ruta para listar usuarios
app.get('/users', async (req, res) => {
    try {
        const usuarios = await prisma.usuario.findMany();
        res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor seguro corriendo en el puerto ${PORT} y escuchando en red local`);
});