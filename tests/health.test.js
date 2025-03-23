const request = require('supertest');
const { app, sequelize } = require('../server');

describe('Health Check', () => {
  afterAll(async () => {
    console.log("DATABASE_URL:", process.env.DATABASE_URL);
    await sequelize.close();  // 🔥 Muy importante: cerrás la conexión
  });

  test('Debe confirmar que la base de datos está sincronizada', async () => {
    const response = await request(app).get('/api/health'); // crea esta ruta simple para test
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Base de datos OK');
  });
});
