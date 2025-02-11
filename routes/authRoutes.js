const express = require("express");
const passport = require("passport");

const router = express.Router();

// Ruta para iniciar sesión con Google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Ruta de redirección después de autenticación
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    console.log("Usuario autenticado:", req.user); // Verificar usuario autenticado
    console.log("Sesión actual:", req.session); // Imprimir sesión
    res.redirect("http://localhost:8081/inicio"); // Redirigir al frontend
  }
);

module.exports = router;