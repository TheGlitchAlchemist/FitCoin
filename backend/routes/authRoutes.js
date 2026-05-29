const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/authController');
const verificarToken = require('../middlewares/authMiddleware'); 

router.post('/register', register);
router.post('/login', login);


router.get('/validate', verificarToken, (req, res) => {
  return res.status(200).json({ 
    valid: true, 
    message: 'Sesión activa y real.',
    user: {
      id: req.user.userId,
      email: req.user.email,
      name: req.user.email ? req.user.email.split('@')[0] : "Usuario" 
    }
  });
});

module.exports = router;