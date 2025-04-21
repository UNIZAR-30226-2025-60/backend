# 📚 Bookly - Backend

Backend para la plataforma **Bookly**, construida con Node.js y Express, usando Sequelize para la conexión a una base de datos PostgreSQL alojada en Neon. El backend se lanza automáticamente desde Render en caso de no estar en local.

- **Producción:** https://backend-dcy8.onrender.com  
- **Ambiente:** Node.js, Express, PostgreSQL (Neon)  
- **Lenguaje:** JavaScript  
- **CI/CD:** Despliegue automático vía commits en `main`

---

## 📁 Estructura del Proyecto

- **📁 db/** → Configuración de Sequelize y conexión a Neon
- **📁 models/** → Definición de modelos de base de datos y consultas complejas
- **📁 routes/** → Endpoints de la API REST
- **📁 tests/** → Pruebas automáticas básicas
- **server.js** → Punto de entrada principal del servidor
- **.env** → Variables de entorno

---

## 🔧 Instalación y entorno local

### 1. Crear archivo `.env` en la raíz con el siguiente contenido:
```env
GOOGLE_CLIENT_ID=18266960434-qc5ctiqq9lhgbbiolqn4fmg4n7dao3pu.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
SESSION_SECRET=19a233f0dd7604f1bab7e10597546934442765d0bd08de5fc12fd5d3e46db2413c55302d871304ab79115dea77c0a2179ba17328364d5d7d58e47bad8e17e8d0
DATABASE_URL=postgresql://neondb_owner:npg_2vWEKt5TQwIV@ep-muddy-frog-a25judd6-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
PORT=3000
VUE_APP_API_MISTRAL=NU60s1BRAKLz1Tmhav0rD4DghDuVYld7
FRONTEND_URL=http://localhost:8081
RENDER_FRONTEND_URL=https://booklyweb-469w.onrender.com
RENDER_GOOGLE_REDIRECT_URI=https://backend-dcy8.onrender.com/auth/google/callback
```

### 2. Instala todas las dependencias mediante los comandos:
```bash
npm install
npm install passport passport-google-oauth20 express-session
npm install sequelize pg pg-hstore
npm install cors
npm install express pg cors dotenv
npm install nodemon --save-dev 
npm install express pg dotenv cors bcrypt jsonwebtoken
```

### 3. Inicia el servidor en local:
```bash
node server.js
```
