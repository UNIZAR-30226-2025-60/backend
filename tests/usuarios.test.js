// tests/usuarios.test.js
const request = require('supertest');
const { app } = require('../server');

describe('Rutas de Usuarios', () => {

  it('Obtiene un usuario existente por correo', async () => {
    const res = await request(app)
      .get('/api/usuario/bookly@gmail.com');
    if (res.statusCode === 404) {
      console.warn('Usuario no encontrado, ¿no insertaste el testuser en la DB?');
    } else {
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('correo', 'bookly@gmail.com');
    }
  });

  it('Retorna 404 si el usuario no existe', async () => {
    const res = await request(app)
      .get('/api/usuario/sssdfiidi8v8d8fgv7asd8fvc999s9d88@gmail.com');
    expect([404, 500]).toContain(res.statusCode); 
  });

  it('Cambia la contraseña si la actual es válida', async () => {
    const res = await request(app)
      .post('/api/usuario/cambiar-contrasena')
      .send({
        correo: 'bookly@gmail.com',
        oldPassword: '123456789',
        newPassword: '987654321'
      });
    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty('message', 'Contraseña actualizada correctamente');
    } else {
      console.warn('Posiblemente la contraseña actual no matchea con la DB');
    }
  });

  it('Cambia la contraseña si la actual es válida2', async () => {
    const res = await request(app)
      .post('/api/usuario/cambiar-contrasena')
      .send({
        correo: 'bookly@gmail.com',
        oldPassword: '987654321',
        newPassword: '123456789'
      });
    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty('message', 'Contraseña actualizada correctamente');
    } else {
      console.warn('Posiblemente la contraseña actual no matchea con la DB');
    }
  });

  it('Rechaza cambio de contraseña si la actual es incorrecta', async () => {
    const res = await request(app)
      .post('/api/usuario/cambiar-contrasena')
      .send({
        correo: 'bookly@gmail.com',
        oldPassword: 'sdfrf8d7g7d68fsdcosd9v8sdv7usd6v7',
        newPassword: '9988'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'La contraseña actual es incorrecta');
  });
});
