const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log("¿JWT_SECRET cargada en entorno?:", process.env.JWT_SECRET ? "SÍ (Existe y tiene valor)" : "NO (Está vacía)");
  
  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      console.error('Falta la variable de entorno JWT_SECRET en el servidor.');
      return res.status(500).json({ error: 'Error interno de configuración del servidor.' });
    }

    const verificado = jwt.verify(token, secret);
    
    req.user = verificado;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado.' });
  }
};

module.exports = verificarToken;