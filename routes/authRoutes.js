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
    console.log("Usuario autenticado:", req.user); // Verificar usuario autenticado
    console.log("Sesión actual:", req.session); // Imprimir sesión
    res.redirect(`${FRONTEND_URL}/inicio`); //Redirigir de manera dinámica
  }
);

module.exports = router;