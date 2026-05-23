

const isValidPassword = (password) => {
  // Longitud mínima de 10 caracteres
  if (password.length < 10) return false;
  
  // Contener al menos una mayúscula
  if (!/[A-Z]/.test(password)) return false;
  
  // Contener al menos una minúscula
  if (!/[a-z]/.test(password)) return false;
  
  // Contener al menos un número
  if (!/[0-9]/.test(password)) return false;
  
  // Contener al menos un carácter especial
  if (!/[^A-Za-z0-9]/.test(password)) return false;
  
  // Que un carácter no se repita más de 3 veces consecutivamente
  if (/(.)\1{3,}/.test(password)) return false;
  
  return true;
};

// Validar formato de email básico 
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

module.exports = {
  isValidPassword,
  isValidEmail
};