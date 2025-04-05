// module.exports = router;
const express = require('express');
const axios = require('axios');
const router = express.Router();


/**
     * @swagger
     * /api/proxy-pdf:
     *   get:
     *     summary: Descargar un PDF desde Google Drive a través del servidor
     *     description: Recibe una URL de Google Drive y redirige la descarga del archivo PDF a través del servidor.
     *     parameters:
     *       - in: query
     *         name: url
     *         required: true
     *         description: URL de Google Drive que contiene el archivo PDF
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: PDF descargado correctamente
     *         content:
     *           application/pdf:
     *             schema:
     *               type: string
     *               format: binary
     *       400:
     *         description: URL inválida o no es de Google Drive
     *       500:
     *         description: Error al descargar el PDF
     */
router.get('/proxy-pdf', async (req, res) => {
  try {
    const driveUrl = decodeURIComponent(req.query.url);
    console.log("🔍 URL recibida en backend:", driveUrl);

    if (!driveUrl.includes("drive.google.com")) {
      return res.status(400).json({ error: '❌ URL inválida o no es de Google Drive' });
    }

    // Extraer el ID del archivo de Google Drive
    const fileIdMatch = driveUrl.match(/id=([^&]+)/);
    if (!fileIdMatch || !fileIdMatch[1]) {
      return res.status(400).json({ error: '❌ No se pudo extraer el ID del archivo' });
    }

    const fileId = fileIdMatch[1];
    const directUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;

    console.log("📥 Descargando PDF desde:", directUrl);

    // Enviar la solicitud a Google Drive
    const response = await axios.get(directUrl, {
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/pdf',
      }
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*'
    });

    response.data.pipe(res);
  } catch (error) {
    console.error("❌ Error en proxyPDF:", error.message);
    res.status(500).json({ error: '❌ Error al descargar el PDF' });
  }
});

module.exports = router;

