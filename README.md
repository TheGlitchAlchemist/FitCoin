# FitCoin 

¡Transforma tu esfuerzo físico en recompensas digitales! **FitCoin** es una plataforma Fullstack móvil diseñada para el seguimiento de transacciones y recompensas financieras basadas en el rendimiento físico y entrenamiento del usuario.

Este proyecto ha sido desarrollado bajo estrictas normativas de seguridad informática, aplicando mecanismos avanzados de protección de datos tanto en el cliente como en el servidor.

---

## Funcionalidades Principales

* **Autenticación Blindada:** Sistema de Login y Registro robusto con validación criptográfica y políticas estrictas de contraseñas.
* **Monitoreo de FitCoins:** Seguimiento en tiempo real de transacciones, historial de recompensas y saldo acumulado por actividades físicas.
* **Gestión de Sesión Persistente:** Almacenamiento seguro del token de sesión en el dispositivo móvil sin riesgo de filtraciones.
* **Arquitectura Desacoplada:** API REST funcional y optimizada que atiende de forma exclusiva las peticiones de la aplicación nativa.
* **Consultas Seguras:** Comunicación eficiente con la base de datos relacional mediante un mapeador relacional de objetos (ORM).

---

## Tecnologías Utilizadas

### Frontend (Mobile App)
* **React Native & Expo:** Framework para el desarrollo de la aplicación nativa optimizada para Android e iOS.
* **Expo SecureStore:** Almacenamiento seguro utilizando cifrado simétrico por hardware (Keychain/Keystore).

### Backend (API Server)
* **Node.js & Express:** Entorno de ejecución y framework web rápido y minimalista para el despliegue de los Endpoints de la API.
* **Prisma ORM:** Mapeador de base de datos de última generación que implementa parametrización automática de consultas.
* **MySQL:** Sistema de gestión de bases de datos relacional para el almacenamiento íntegro del sistema.


---
    
## Estructura del Proyecto

El repositorio está organizado en una arquitectura monorepo limpia, separando estrictamente las responsabilidades del cliente y el servidor:
```text
FitCoin/
├── backend/                  # Código fuente del servidor de la API
│   ├── controllers/          # Lógica de negocio y control de endpoints
│   │   └── authController.js
│   ├── routes/               # Enrutadores lógicos de Express
│   │   └── authRoutes.js
│   ├── utils/                # Módulos helpers y validadores de seguridad
│   │   └── validators.js
│   ├── prisma/               # Configuración de base de datos y esquemas
│   │   └── schema.prisma
│   ├── index.js              # Punto de entrada de la aplicación Express
│   ├── .env                  # Variables de entorno locales (Excluido de Git)
│   └── .gitignore            # Archivos ignorados en el servidor
│
├── frontend/                 # Código fuente de la aplicación móvil (Expo)
│   ├── Screens/              # Pantallas de la interfaz de usuario
│   │   ├── Login/
│   │   └── Register/
│   ├── assets/               # Recursos estáticos locales
│   ├── app.json              # Configuración global de la App de Expo
│   └── .gitignore            # Archivos ignorados en el cliente
