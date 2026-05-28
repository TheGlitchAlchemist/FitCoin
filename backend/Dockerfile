# Usa una imagen oficial ligera de Node.js basada en Alpine Linux
FROM node:18-slim

RUN apt-get update -y && apt-get install -y openssl

# Crear directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm install --only=production

# Copiar el esquema de Prisma y generar el cliente
COPY prisma ./prisma
RUN npx prisma generate

# Copiar el resto del código del backend
COPY . .

# Exponer el puerto 3000 en el que corre Express
EXPOSE 3000

# Comando para arrancar la aplicación
CMD ["node", "index.js"]