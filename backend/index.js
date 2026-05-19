const express = require ('express');
const {PrismaClient} = require('@prisma/client');
const cors = require('cors');

const app = express();
const prisma =new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

//Ruta de prueba de respuesta

app.get('/',(req,res)=> {
    res.send('Servidor conectado');
});

//Ruta para listar usuarios
app.get('/users', async (req,res) => {
    try {
        const usuarios = await prisma.usuario.findMany();
        res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Error al obtener usuarios'});
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://127.0.0.1:${PORT}`);
});