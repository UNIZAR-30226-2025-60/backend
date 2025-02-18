const express = require("express");
const passport = require("passport");

const router = express.Router();

// Ruta para iniciar sesión con Google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

//si esta usandose desde render se redirige a la pagina de inicio de la aplicacion
//si no se redirige a localhost:8081/inicio
const REDIRECT_URL = process.env.RENDER ? 'https://tu-frontend.onrender.com/inicio' : 'http://localhost:8081/inicio';

// Ruta de redirección después de autenticación
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    console.log("Usuario autenticado:", req.user); // Verificar usuario autenticado
    console.log("Sesión actual:", req.session); // Imprimir sesión
    res.redirect(REDIRECT_URL); // Redirigir dinámicamente
  }
);

module.exports = router;