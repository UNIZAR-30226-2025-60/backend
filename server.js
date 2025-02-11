// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use(cors());
// app.use(express.json());

// const librosRoutes = require('./routes/libros');
// const usuariosRoutes = require('./routes/usuarios');

// app.use('/api/libros', librosRoutes);
// app.use('/api/usuarios', usuariosRoutes);

// app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));

const express = require("express");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
require("dotenv").config();

const { sequelize } = require("./db/db");
const User = require("./models/User");

// Importar rutas
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const librosRoutes = require("./routes/libros");
const usuariosRoutes = require("./routes/usuarios");

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS
app.use(
  cors({
    origin: "http://localhost:8081", // Modificar si el frontend tiene otro origen
    credentials: true, // Permitir envío de cookies y autenticación
  })
);

// Middleware para procesar JSON
app.use(express.json());

// Sincronizar base de datos con Sequelize
sequelize
  .sync({ force: false })
  .then(() => console.log("✅ Base de datos sincronizada."))
  .catch((err) => console.error("❌ Error al sincronizar DB:", err));


// Configuración de sesión
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, // Evita sesiones vacías
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    },
  })
);

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Configurar estrategia de Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ where: { googleId: profile.id } });
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
          });
        }
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serializar y deserializar usuario
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Usar rutas
app.use("/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api/libros", librosRoutes);
app.use("/api/usuarios", usuariosRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
