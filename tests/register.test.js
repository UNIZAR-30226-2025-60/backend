// tests/register.test.js
const request = require('supertest');
const { app } = require('../server');

describe('Registro de usuario', () => {
  it('Registra un nuevo usuario y lo inicia sesión automáticamente', async () => {
    // Genera un correo aleatorio para no chocar con uno existente
    const randomEmail = `test_${Date.now()}@example.com`;
    const nuevoUsuario = {
      nombre: 'NuevoTest',
      correo: randomEmail,
      contrasena: 'passRegistro'
    };

    const res = await request(app)
      .post('/api/registro')
      .send(nuevoUsuario);

    // Esperamos un 201
    expect(res.statusCode).toBe(201);
    // Debe devolver algo como { usuario: {...}, listaFavoritos: {...} }
    expect(res.body).toHaveProperty('usuario');
    expect(res.body.usuario).toHaveProperty('correo', randomEmail);
    expect(res.body).toHaveProperty('listaFavoritos');
  });

  it('Debe fallar si ya existe el correo en la DB', async () => {
    // Asumiendo que "bookly@gmail.com" ya existe
    const res = await request(app)
      .post('/api/registro')
      .send({
        nombre: 'Bookly',
        correo: 'bookly@gmail.com',
        contrasena: 'password'
      });
    // En tu backend, si el correo ya existe, podría devolver 500 u otro code
    expect(res.statusCode).toBe(500);
    expect(res.text).toContain('Error al registrar usuario');
  });
});
