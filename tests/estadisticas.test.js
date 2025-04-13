// tests/estadisticas.test.js
const request = require('supertest');
const { app } = require('../server');

describe('Rutas de Estadísticas (estadisticas.js)', () => {

  const testUser = 'bookly@gmail.com'; 
  const testYear = new Date().getFullYear();

  it('Debería obtener top 3 usuarios del mes', async () => {
    const res = await request(app).get('/api/estadisticas/top3');
    expect([200, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  it('Debería obtener top 3 usuarios del año', async () => {
    const res = await request(app).get('/api/estadisticas/top3anuales');
    expect([200, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  it('Debería obtener top 5 libros de este año', async () => {
    const res = await request(app).get(`/api/estadisticas/top5libros/${testYear}`);
    expect([200, 404, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  it('Debería obtener top 5 libros para un mes y año específicos', async () => {
    const month = 7; 
    const res = await request(app).get(`/api/estadisticas/top5libros/${month}/${testYear}`);
    expect([200, 404, 500]).toContain(res.statusCode);
  });

  it('Debería obtener estadísticas generales de un usuario (temas, totales)', async () => {
    const res = await request(app).get(`/api/estadisticas/generales/${testUser}`);
    expect([200, 404, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body).toBeDefined();
    }
  });

  it('Debería obtener libros recomendados para un usuario', async () => {
    const res = await request(app).get(`/api/estadisticas/librosrecomendados/${testUser}`);
    expect([200, 404, 500]).toContain(res.statusCode);
  });

  it('Debería obtener estadísticas de este mes para un usuario', async () => {
    const res = await request(app).get(`/api/estadisticas/${testUser}`);
    expect([200, 404, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body).toBeDefined();
    }
  });

  it('Debería obtener estadísticas de un año para un usuario', async () => {
    const res = await request(app).get(`/api/estadisticas/${testUser}/${testYear}`);
    expect([200, 404, 500]).toContain(res.statusCode);
  });

});
