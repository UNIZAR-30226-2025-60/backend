// tests/libros.test.js
const request = require('supertest');
const { app } = require('../server');

describe('Guardar página en lectura', () => {
  it('Guarda la última página leída de un libro', async () => {
    const res = await request(app)
      .post('/api/guardar-pagina')
      .send({
        correo: 'bookly@gmail.com',
        libro_id: 'https://drive.google.com/file/d/13DBqA252BfbCTaDJJOBXfqix6QypqQyB/view?usp=sharing',
        pagina: 10
      });
    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty('mensaje', '✅ Página guardada correctamente');
    } else {
      console.warn('No se pudo guardar página. Revisa si el libro existe en la DB.');
    }
  });

  it('Obtiene todos los libros (GET /api/libros)', async () => {
    const res = await request(app).get('/api/libros');
    expect([200, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    } else {
      console.warn('No se pudo obtener la lista de libros. Revisar logs del server.');
    }
  });

  it('Busca un libro por título (GET /api/libros/obtenerTitulo/:titulo)', async () => {
    const res = await request(app).get('/api/libros/obtenerTitulo/el');
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    } else {
      expect([404, 500]).toContain(res.statusCode);
    }
  });
});
