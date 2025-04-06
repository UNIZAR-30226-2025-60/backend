const express = require("express");

const router = express.Router();

// Ruta para obtener los datos del usuario autenticado
/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Obtener los datos del usuario autenticado
 *     description: Devuelve los datos del usuario actualmente autenticado. Si el usuario no está autenticado, devuelve un error 401.
 *     responses:
 *       200:
 *         description: Datos del usuario autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 correo:
 *                   type: string
 *                   description: Correo electrónico del usuario autenticado
 *                 nombre:
 *                   type: string
 *                   description: Nombre del usuario autenticado
 *       401:
 *         description: El usuario no está autenticado
 */
router.get("/user", (req, res) => {
  // if (!req.isAuthenticated()) {
  //   return res.status(401).json({ error: "No autenticado" });
  // }
  res.json(req.user);
});

module.exports = router;
