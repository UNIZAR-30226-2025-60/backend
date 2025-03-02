const express = require("express");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
require("dotenv").config();

const { sequelize, pool } = require("./db/db");
const { User } = require("./models/User");  
const { Libro } = require("./models/Libro"); 
const { Tema } = require("./models/Tema");  
const { Opinion } = require("./models/Opiniones");
const { Lista } = require("./models/Listas");
const { Fragmento } = require("./models/Fragmento");
const { Leido } = require("./models/Leido");


// Importar rutas
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const librosRoutes = require("./routes/libros");
const usuariosRoutes = require("./routes/usuarios");
const apiForoRoutes = require('./routes/APIforo');
const opinionesRoutes = require("./routes/opiniones");  
const listasRoutes = require("./routes/listas");
const fragmentosRoutes = require("./routes/fragmentos");
const estadisticasRoutes = require("./routes/estadisticas");
const proxyPDF = require('./routes/proxyPDF');

const { FOREIGNKEYS } = require("sequelize/lib/query-types");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", 1);// Para que las cookies funcionen en producción(render)

// Configuración de CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:8081",
  process.env.RENDER_FRONTEND_URL || "https://booklyweb-469w.onrender.com"
];

// app.use(
//   cors({
//     origin: allowedOrigins,
//     credentials: true,
//   })
// );
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, 
  })
);

// Middleware para procesar JSON
app.use(express.json());

// Sincronizar base de datos con Sequelize
// sequelize
//   .sync({ force: false })
//   .then(() => console.log("✅ Base de datos sincronizada."))
//   .catch((err) => console.error("❌ Error al sincronizar DB:", err));

sequelize.sync({ force: false }) // Cambia a `true` si deseas sobrescribir la estructura
  .then(() => console.log("✅ Base de datos sincronizada."))
  .catch((err) => console.error("❌ Error al sincronizar DB:", err));

  
// Ejecutar triggers.sql
const fs = require('fs');
const path = require('path');
(async () => {
  try {
    const triggersPath = path.join(__dirname, 'triggers.sql');
    const triggersSQL = fs.readFileSync(triggersPath, 'utf-8');
    await pool.query(triggersSQL);
    console.log('✅ Triggers ejecutados correctamente.');
  } catch (error) {
    console.error('❌ Error al ejecutar triggers:', error);
  }
})();


// Configuración de sesión
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, // Evita sesiones vacías
    cookie: {
      // httpOnly: true,
      httpOnly: false,
      // secure: false,
      // sameSite: "lax",
      secure: process.env.NODE_ENV === "production", // true en producción
      sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
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
      // callbackURL: process.env.GOOGLE_REDIRECT_URI,
      callbackURL: process.env.NODE_ENV === "production"
      ? process.env.RENDER_GOOGLE_REDIRECT_URI // En producción, Render
      : process.env.GOOGLE_REDIRECT_URI,      // En local, localhost
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ where: { correo: profile.emails[0].value } });
        if (!user) {
          user = await User.create({
            correo: profile.emails[0].value,
            nombre: profile.displayName,
            contrasena: null,
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
  done(null, user.correo);
});

passport.deserializeUser(async (correo, done) => {
  try {
    const user = await User.findOne({ where: { correo } });
    console.log("🔄 Deserializando usuario:", user?.correo); // Verifica si el usuario se carga
    done(null, user ? user.get({ plain: true }) : null);
  } catch (error) {
    done(error, null);
  }
});


(async () => {
  try {
      // Prueba de conexión a la base de datos
      console.log("🛠 Conectando a la base de datos en:", process.env.DATABASE_URL);
      await sequelize.authenticate();
      console.log('✅ Conexión a la base de datos establecida con éxito.');

      // Sincronizar base de datos
      await sequelize.sync({ force: false }); // Cambia a `true` si deseas sobrescribir la estructura
      console.log("✅ Base de datos sincronizada.");
  } catch (error) {
      console.error('❌ Error al conectar o sincronizar la base de datos:', error);
      process.exit(1); // Detiene la aplicación si no puede conectar a la base de datos
  }
})();

// Usar rutas
app.use("/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api/libros", librosRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api", usuariosRoutes);
app.use("/api", apiForoRoutes);
app.use("/api/opiniones", opinionesRoutes); 
app.use("/api/listas", listasRoutes);
app.use("/api/fragmentos", fragmentosRoutes);
app.use("/api/estadisticas", estadisticasRoutes);
app.use('/api', proxyPDF);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
