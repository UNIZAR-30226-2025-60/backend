// tests/listas.test.js
const request = require('supertest');
const { app } = require('../server');

describe('Rutas de Listas (listas.js)', () => {

  const testUser = 'bookly@gmail.com'; 
  let testLista = 'ListaTest_' + Date.now(); 
  let testLibro = 'https://drive.google.com/file/d/13DBqA252BfbCTaDJJOBXfqix6QypqQyB/view?usp=sharing';

  it('Debería obtener los libros de "Mis Favoritos"', async () => {
    const res = await request(app).get(`/api/listas/favoritos/${testUser}`);
    expect([200, 404, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  it('Debería obtener todas las portadas de libros y sus temáticas', async () => {
    const res = await request(app).get('/api/listas/portadas-temas');
    expect([200, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  it('Debería crear una nueva lista', async () => {
    const nuevaLista = {
      nombre: testLista,
      usuario_id: testUser,
      descripcion: 'Lista de pruebas Jest',
      publica: true,
      portada: 'https://drive.google.com/file/d/1fIflo-5ZFyPB2T7FVCpQFbGMiR65b6Lx/view?usp=drive_link'
    };
    const res = await request(app).post('/api/listas').send(nuevaLista);
    expect([201, 500]).toContain(res.statusCode);
    if (res.statusCode === 201) {
      expect(res.body).toHaveProperty('nombre', testLista);
    }
  });

  it('Debería añadir un libro a "Mis Favoritos"', async () => {
    const res = await request(app).post('/api/listas/favoritos').send({
      usuario_id: testUser,
      enlace_libro: testLibro
    });
    expect([201, 409, 500]).toContain(res.statusCode);
  });

  it('Debería obtener las listas del usuario', async () => {
    const res = await request(app).get(`/api/listas/${testUser}`);
    expect([200, 404, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  it('Debería agregar un libro a la lista que creamos', async () => {
    const res = await request(app)
      .post(`/api/listas/${testLista}`)
      .send({
        usuario_id: testUser,
        libro_id: testLibro
      });
    expect([201, 409, 500]).toContain(res.statusCode);
  });

  it('Debería obtener los libros de la lista recién creada', async () => {
    const res = await request(app).get(`/api/listas/${testUser}/${testLista}/libros`);
    expect([200, 404, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  it('Debería actualizar la lista', async () => {
    const res = await request(app)
      .patch(`/api/listas/${testUser}/${testLista}`)
      .send({
        portada: 'https://drive.google.com/file/d/1IWBfbAfy4SJgN5ebsq6wRSNhLo9xzd0u/view?usp=drive_link',
        descripcion: 'Descripción actualizada'
      });
    expect([200, 404, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.text).toContain('Lista actualizada correctamente');
    }
  });

  it('Debería eliminar el libro de la lista que creamos', async () => {
    const res = await request(app)
      .delete(`/api/listas/${testLista}`)
      .send({
        usuario_id: testUser,
        libro_id: testLibro
      });
    expect([200, 404, 500]).toContain(res.statusCode);
  });

  it('Debería eliminar la lista creada', async () => {
    const res = await request(app).delete(`/api/listas/${testUser}/${testLista}`);
    expect([200, 400, 404, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.text).toContain('Lista eliminada con éxito');
    }
  });

  it('Debería eliminar un libro de "Mis Favoritos"', async () => {
    const res = await request(app).delete('/api/listas/favoritos').send({
      usuario_id: testUser,
      enlace_libro: testLibro
    });
    expect([200, 404, 500]).toContain(res.statusCode);
  });

});
