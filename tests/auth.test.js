// tests/auth.test.js
const request = require('supertest');
const { app, sequelize } = require('../server'); 

jest.setTimeout(10_000);

process.env.FRONTEND_URL = 'http://localhost';


const testUser = {
  correo:     'bookly@gmail.com',
  nombre:     'Bookly',
  contrasena: '123456789'
};


beforeAll(async () => {
  await request(app)
    .post('/api/registro')
    .send(testUser)
    .catch(() => {});
});

afterAll(async () => {
  await sequelize.close();             
});



it('Inicia sesión con credenciales válidas', async () => {
  const res = await request(app)
    .post('/api/login')
    .send({ correo: testUser.correo, contrasena: testUser.contrasena });

  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty('correo', testUser.correo);
});

it('Falla si el usuario no existe', async () => {
  const res = await request(app)
    .post('/api/login')
    .send({
      correo: `noExiste_${Date.now()}@ejemplo.com`,
      contrasena: 'loquesea'
    });

  expect(res.statusCode).toBe(401);
  expect(res.text).toContain('Correo o contraseña incorrectos');
});

it('Falla si la contraseña es incorrecta', async () => {
  const res = await request(app)
    .post('/api/login')
    .send({
      correo: testUser.correo,
      contrasena: 'contraseña-incorrecta'
    });

  expect(res.statusCode).toBe(401);
  expect(res.text).toContain('Correo o contraseña incorrectos');
});
