const request = require('supertest');
const { app, sequelize } = require('../server');

describe('Health Check', () => {
  afterAll(async () => {
    await sequelize.close(); 
  });

  test('Debe confirmar que la base de datos está sincronizada', async () => {
    const response = await request(app).get('/api/health'); 
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Base de datos OK');
  });
});
