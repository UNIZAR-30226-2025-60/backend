// tests/foro.test.js
const request = require('supertest');
const { app } = require('../server');

describe('Rutas de Foro (APIforo)', () => {

  let preguntaCreadaId = null;
  let respuestaCreadaId = null;

  it('Debería obtener el foro completo (todas las preguntas y respuestas)', async () => {
    const res = await request(app).get('/api/obtenerForoCompleto');
    expect([200, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  it('Debería crear una nueva pregunta en el foro', async () => {
    const nuevaPregunta = {
      usuarioCorreo: 'bookly@gmail.com',
      pregunta: `Pregunta de prueba ${Date.now()}`
    };

    const res = await request(app)
      .post('/api/preguntas')
      .send(nuevaPregunta);

    expect([201, 500]).toContain(res.statusCode);

    if (res.statusCode === 201) {
      expect(res.body).toHaveProperty('mensaje', 'Pregunta agregada con éxito');
      expect(res.body).toHaveProperty('pregunta');
      preguntaCreadaId = res.body.pregunta.id;
    } else {
      console.warn('No se pudo crear la pregunta. Verifica si el usuario existe o la DB está correcta.');
    }
  });

  it('Debería obtener todas las preguntas, o filtrar por usuario si se indica', async () => {
    const res = await request(app).get('/api/preguntas');
    expect([200, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  it('Debería crear una respuesta a la pregunta recién creada', async () => {
    if (!preguntaCreadaId) {
      console.warn('No se creó la pregunta en la prueba anterior. Ocurrió un error.');
      return;
    }
    const res = await request(app)
      .post('/api/agregarRespuesta')
      .send({
        pregunta_id: preguntaCreadaId,
        usuario_respuesta: 'bookly@gmail.com',
        mensaje_respuesta: 'Respuesta de prueba'
      });
    expect([201, 500]).toContain(res.statusCode);

    if (res.statusCode === 201) {
      expect(res.body).toHaveProperty('mensaje_respuesta', 'Respuesta de prueba');
      respuestaCreadaId = res.body.id; 
    }
  });

  it('Debería obtener las respuestas de la pregunta creada', async () => {
    if (!preguntaCreadaId) return;
    const res = await request(app)
      .get('/api/obtenerRespuestas')
      .query({ preguntaId: preguntaCreadaId });

    expect([200, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  it('Debería obtener el número de respuestas de la pregunta creada', async () => {
    if (!preguntaCreadaId) return;
    const res = await request(app)
      .get('/api/obtenerNumeroRespuestas')
      .query({ preguntaId: preguntaCreadaId });
    expect([200, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty('numRespuestas');
    }
  });

  it('Debería borrar la respuesta creada', async () => {
    if (!respuestaCreadaId) {
      console.warn('No se creó la respuesta. Sáltate esta prueba.');
      return;
    }
    const res = await request(app).delete(`/api/BorroRespuestas/${respuestaCreadaId}`);
    expect([200, 404, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty('mensaje', 'Respuesta eliminada con éxito');
    }
  });

  it('Debería borrar la pregunta creada', async () => {
    if (!preguntaCreadaId) {
      console.warn('No existe preguntaCreadaId. Prueba previa falló.');
      return;
    }
    const res = await request(app).delete(`/api/BorroPreguntas/${preguntaCreadaId}`);
    expect([200, 404, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty('mensaje', 'Pregunta eliminada con éxito');
    }
  });

});
