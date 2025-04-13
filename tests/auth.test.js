// tests/auth.test.js
const request = require('supertest');
const { app } = require('../server'); // Importamos app

describe('Pruebas de autenticación de usuario', () => {
  // Supongamos que tenemos en DB un usuario con:
  //   correo = 'bookly@gmail.com'
  //   contrasena encriptada = '123456789' 
  
  it('Falla si el usuario no existe', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        correo: 'aadsjfdkeeeekslsl@gmail.com',
        contrasena: 'ddf9d8876d6fccfd99sdcsdcf99'
      });
    expect(res.statusCode).toBe(401);
    expect(res.text).toContain('Correo o contraseña incorrectos');
  });

  it('Falla si la contraseña es incorrecta', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        correo: 'bookly@gmail.com',
        contrasena: 'wrongpass'
      });
    expect(res.statusCode).toBe(401);
    expect(res.text).toContain('Correo o contraseña incorrectos');
  });

  it('Inicia sesión con credenciales válidas', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        correo: 'bookly@gmail.com',
        contrasena: '123456789'
      });
    expect(res.statusCode).toBe(200);
    // Tu backend envía el user en JSON
    expect(res.body).toHaveProperty('correo', 'bookly@gmail.com');
  });
});
