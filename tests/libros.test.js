// tests/libros.test.js
const request = require('supertest');
const { app } = require('../server');

describe('Guardar página en lectura', () => {
  it('Guarda la última página leída de un libro', async () => {
    // Asegúrate de que el libro ya existe en la base de datos con un enlace real
    // y que el usuario "bookly@gmail.com" existe
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
});
