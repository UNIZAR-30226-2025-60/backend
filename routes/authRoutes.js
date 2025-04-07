const express = require("express");
const passport = require("passport");

const router = express.Router();

const isLocal = process.env.NODE_ENV !== "production";
const FRONTEND_URL = isLocal
  ? "http://localhost:8081"
  : "https://booklyweb-469w.onrender.com";

// Ruta para iniciar sesión con Google
/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Iniciar sesión con Google
 *     description: Redirige a la autenticación de Google para iniciar sesión en la aplicación.
 *     responses:
 *       302:
 *         description: Redirige a Google para la autenticación
 *       500:
 *         description: Error al redirigir a la autenticación de Google
 */

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Ruta de redirección después de autenticación en web
/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Callback de Google después de la autenticación
 *     description: Redirige al frontend después de que el usuario haya autenticado su cuenta de Google. Guarda el correo en la cookie y redirige.
 *     responses:
 *       302:
 *         description: Redirige al frontend con la cookie de sesión
 *       500:
 *         description: Error al procesar la autenticación de Google
 */
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    console.log("✅ Usuario autenticado con Google:", req.user);
    console.log("📌 Sesión actual:", req.session);
    res.cookie("isGoogleAuth", "true", {
      httpOnly: false, // Necesario para acceder desde el frontend
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      domain: isLocal ? undefined : "booklyweb-469w.onrender.com", // <-- AÑADIDO
      maxAge: 24 * 60 * 60 * 1000, // 1 día de duración
    });

    // **Si el usuario está autenticado, guardar su correo en la cookie**
    if (req.user) {
      res.cookie("userEmail", req.user.correo, {
        httpOnly: false, // Necesario para acceder desde el frontend
        secure: process.env.NODE_ENV === "production", // En producción, debe ser seguro
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Configuración SameSite
        domain: isLocal ? undefined : "booklyweb-469w.onrender.com",  // Dominio en producción
        maxAge: 24 * 60 * 60 * 1000, // 1 día de duración
      });
    }
    // Redirigir al frontend
    res.redirect(`${FRONTEND_URL}/`);
  }
);

module.exports = router;
