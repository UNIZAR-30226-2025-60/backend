// tests/register.test.js
const request = require('supertest');
const { app } = require('../server');

describe('Registro de usuario', () => {
  it('Registra un nuevo usuario y lo inicia sesión automáticamente', async () => {
    const randomEmail = `test_${Date.now()}@example.com`;
    const nuevoUsuario = {
      nombre: 'NuevoTest',
      correo: randomEmail,
      contrasena: 'passRegistro'
    };

    const res = await request(app)
      .post('/api/registro')
      .send(nuevoUsuario);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('usuario');
    expect(res.body.usuario).toHaveProperty('correo', randomEmail);
    expect(res.body).toHaveProperty('listaFavoritos');
  });

  it('Falla si el correo ya existe', async () => {
    const res = await request(app)
      .post('/api/registro')
      .send({
        nombre: 'Bookly',
        correo: 'bookly@gmail.com',
        contrasena: 'password'
      });
    expect(res.statusCode).toBe(500);
    expect(res.text).toContain('Error al registrar usuario');
  });
});
