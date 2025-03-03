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

    const cookieOptions = {
      httpOnly: false,  // ⚠️ Permitir acceso desde el frontend
      secure: process.env.NODE_ENV === "production", // HTTPS en producción
      sameSite: "None", // 🔥 Para que funcione en Render
      domain: process.env.NODE_ENV === "production" ? "booklyweb-469w.onrender.com" : undefined,
      maxAge: 24 * 60 * 60 * 1000, // 1 día de duración
    };
    res.cookie("userEmail", req.user.correo, cookieOptions);
    res.setHeader("Set-Cookie", `userEmail=${req.user.correo}; Secure; HttpOnly=false; SameSite=None; Path=/`);

    console.log("🍪 Cookie establecida en backend:", cookieOptions);
    

    // Redirigir al frontend
    res.redirect(`${FRONTEND_URL}/inicio`);
  }
);

module.exports = router;
