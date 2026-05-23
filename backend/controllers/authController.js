const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { isValidPassword, isValidEmail } = require('../utils/validators');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'El formato del correo electrónico no es válido.' });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({ 
        error: 'La contraseña no cumple con las políticas de seguridad.' 
      });
    }

    const existingUser = await prisma.usuario.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.usuario.create({
      data: {
        nombre: name,
        email: email,
        password: hashedPassword,
        fitcoins_saldo: 0.0,
      },
    });

    res.status(201).json({ message: 'Usuario registrado con éxito.', userId: newUser.id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor al registrar.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos.' });
    }

    const user = await prisma.usuario.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login exitoso.',
      token,
      user: { id: user.id, name: user.nombre, email: user.email, saldo: user.fitcoins_saldo }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor al iniciar sesión.' });
  }
};

module.exports = {
  register,
  login
};