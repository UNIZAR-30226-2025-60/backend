// tests/logout.test.js
const request = require('supertest');
const { app } = require('../server');

describe('Cerrar sesión', () => {
  it('Elimina cookies y cierra sesión', async () => {
    const res = await request(app).get('/api/logout');
    expect(res.statusCode).toBe(200); 
    expect(res.text).toContain('Sesión cerrada correctamente.');
    // Podríamos también examinar cabeceras para ver si se limpian cookies
  });
});
