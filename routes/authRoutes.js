// const express = require("express");
// const passport = require("passport");

// const router = express.Router();

// const isLocal = process.env.NODE_ENV !== "production";
// const FRONTEND_URL = isLocal
//   ? "http://localhost:8081"
//   : "https://booklyweb-469w.onrender.com";

// // Ruta para iniciar sesión con Google
// router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// // Ruta de redirección después de autenticación
// router.get(
//   "/google/callback",
//   passport.authenticate("google", { failureRedirect: "/" }),
//   (req, res) => {
//     console.log("✅ Usuario autenticado con Google:", req.user);
//     console.log("📌 Sesión actual:", req.session);

//     // **Si el usuario está autenticado, guardar su correo en la cookie**
//     if (req.user) {
//       res.cookie("userEmail", req.user.correo, {
//         httpOnly: false, // Necesario para acceder desde el frontend
//         secure: process.env.NODE_ENV === "production",
//         sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//         maxAge: 24 * 60 * 60 * 1000, // 1 día de duración
//       });
//     }
//     // Redirigir al frontend
//     res.redirect(`${FRONTEND_URL}/inicio`);
//   }
// );


// module.exports = router;
const express = require("express");
const passport = require("passport");

const router = express.Router();

const isLocal = process.env.NODE_ENV !== "production";
const FRONTEND_URL = isLocal
  ? "http://localhost:8081"
  : "https://booklyweb-469w.onrender.com";

// Ruta para iniciar sesión con Google
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    console.log("✅ Usuario autenticado con Google:", req.user);
    console.log("📌 Sesión actual:", req.session);

    if (!req.user) {
      console.error("❌ Error: `req.user` es `undefined`, la autenticación falló.");
      return res.status(500).json({ error: "Error en la autenticación con Google." });
    }

    // 🔥 Definir opciones de la cookie antes de usarla
    const cookieOptions = {
      httpOnly: false, // ⚠️ Permitir acceso desde el frontend
      secure: process.env.NODE_ENV === "production", // HTTPS en producción
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 día de duración
    };

    // 🌟 Establecer la cookie con las opciones definidas
    res.cookie("userEmail", req.user.correo, cookieOptions);

    console.log("🍪 Cookie establecida correctamente con opciones:", cookieOptions);

    // Redirigir al frontend
    res.redirect(`${FRONTEND_URL}/inicio`);
  }
);

module.exports = router;
