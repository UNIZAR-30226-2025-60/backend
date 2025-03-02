const express = require("express");
const passport = require("passport");

const router = express.Router();

const isLocal = process.env.NODE_ENV !== "production";
const FRONTEND_URL = isLocal
  ? "http://localhost:8081"
  : "https://booklyweb-469w.onrender.com";

// Ruta para iniciar sesión con Google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Ruta de redirección después de autenticación
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
    // Solo asignar `domain` en producción (Render)
    if (process.env.NODE_ENV === "production") {
      cookieOptions.domain = "booklyweb-469w.onrender.com"; // Dominio de tu frontend en Render
    }
    res.cookie("userEmail", req.user.correo, cookieOptions);
    console.log("🍪 Cookie establecida con opciones:", cookieOptions);
    // Redirigir al frontend
    res.redirect(`${FRONTEND_URL}/inicio`);
  }
);


module.exports = router;