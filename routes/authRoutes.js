const express = require("express");
const passport = require("passport");

const router = express.Router();

const isLocal = process.env.NODE_ENV !== "production";
const FRONTEND_URL = isLocal
  ? "http://localhost:8081"
  : "https://booklyweb-469w.onrender.com";

// Ruta para iniciar sesión con Google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Ruta de redirección después de autenticación en web
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    console.log("✅ Usuario autenticado con Google:", req.user);
    console.log("📌 Sesión actual:", req.session);

    // **Si el usuario está autenticado, guardar su correo en la cookie**
    if (req.user) {
      res.cookie("userEmail", req.user.correo, {
        httpOnly: false, // Necesario para acceder desde el frontend
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000, // 1 día de duración
      });
    }
    // Redirigir al frontend
    res.redirect(`${FRONTEND_URL}/inicio`);
  }
);

// Ruta de redirección después de autenticación en móvil
router.get(
  "/google/callbackM",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    console.log("✅ Usuario autenticado con Google:", req.user);
    console.log("📌 Sesión actual:", req.session);

    if (req.user) {
      res.json({
        usuario: {
          id: req.user.id,
          nombre: req.user.displayName,
          correo: req.user.email, // Agregar el correo aquí
          // foto: req.user.photos ? req.user.photos[0].value : null, // Foto de perfil si está disponible
        },
        sesion: req.session,
      });
    } else {
      res.status(401).json({ error: "No se pudo autenticar al usuario" });
    }
  }
);


module.exports = router;