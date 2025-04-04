const express = require("express");

const router = express.Router();

// Ruta para obtener los datos del usuario autenticado
router.get("/user", (req, res) => {
  // if (!req.isAuthenticated()) {
  //   return res.status(401).json({ error: "No autenticado" });
  // }
  res.json(req.user);
});

module.exports = router;
