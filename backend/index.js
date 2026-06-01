const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes'); 
const helmet = require('helmet');
const crypto = require('crypto'); 

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(helmet());

// ENERACIÓN PAR DE CLAVES (Pública y Privada) PARA DEMOSTRACIÓN DE FIRMAS ASIMÉTRICAS RSA
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
});

app.use('/api/auth', authRoutes); 

// ENDPOINT EXCLUSIVO PARA COMPROBAR LA VERIFICACIÓN DE AUTENTICIDAD (Firmas Digitales)
app.get('/api/auth/demostracion-firma', (req, res) => {
  // Datos simulados de una transferencia de FitCoins
  const datosTransaccion = JSON.stringify({ 
    emisor: "Luis Valencia", 
    receptor: "Servidor FitCoin", 
    monto: 100 
  });

  // El servidor genera la Firma Digital usando su Clave Privada
  const firma = crypto.sign("sha256", Buffer.from(datosTransaccion), {
    key: privateKey,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
  });

  // El sistema receptor verifica la autenticidad usando la Clave Pública emparejada
  const esAutentico = crypto.verify(
    "sha256",
    Buffer.from(datosTransaccion),
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    },
    firma
  );

  res.json({
    explicacion: "Demostración de Integridad y No Repudio mediante Criptografía Asimétrica RSA",
    datosOriginales: JSON.parse(datosTransaccion),
    firmaDigitalHex: firma.toString('hex'), // La firma que viaja para validar autenticidad
    autenticidadVerificada: esAutentico     // Retornará true confirmando que los datos no fueron alterados
  });
});

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