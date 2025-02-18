// models/Libro.js
const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../db/db');  // Asegúrate de que esta ruta esté correcta

// Definir el modelo para la tabla LIBRO
const Libro = sequelize.define('Libro', {
    enlace: {
        type: DataTypes.TEXT,
        primaryKey: true,  // La columna 'enlace' es la clave primaria
        allowNull: false,  // No puede ser nulo
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,  // No puede ser nulo
    },
    autor: {
        type: DataTypes.STRING,
        allowNull: false,  // No puede ser nulo
    },
    fecha_publicacion: {
        type: DataTypes.DATE,
        allowNull: false,  // No puede ser nulo
    },
    resumen: {
        type: DataTypes.TEXT,
        allowNull: true,  // Puede ser nulo
    },
    imagen_portada: {
        type: DataTypes.STRING,
        allowNull: true,  // Puede ser nulo
    },
    num_paginas: {
        type: DataTypes.INTEGER,
        allowNull: true,  // Puede ser nulo
    },
    num_palabras: {
        type: DataTypes.INTEGER,
        allowNull: true,  // Puede ser nulo
    },
    horas_lectura: {
        type: DataTypes.INTEGER,
        allowNull: true,  // Puede ser nulo
    },
    contador_lecturas: {
        type: DataTypes.INTEGER,
        allowNull: true,  // Puede ser nulo
    },
    puntuacion_media: {
        type: DataTypes.FLOAT,
        defaultValue: 0,  // Valor por defecto 0
    },
}, {
    tableName: 'libro',  // El nombre de la tabla en la base de datos
    timestamps: false,  // No usaremos createdAt / updatedAt
});

// Función para obtener libros por temática
const obtenerLibrosPorTematica = async (tematica) => {
    try {
        const libros = await sequelize.query(
            `SELECT l.* FROM libro l
             JOIN tema_asociado t ON l.enlace = t.enlace
             WHERE t.tematica = :tematica`,
            {
                replacements: { tematica },
                type: sequelize.QueryTypes.SELECT
            }
        );
        return libros;
    } catch (error) {
        throw new Error('Error al obtener libros por temática');
    }
};


const obtenerLibrosEnProcesoPorUsuario = async (correo) => {
    try {
      const libros = await sequelize.query(
        `SELECT l.*, ep.pagina FROM en_proceso ep
         JOIN libro l ON ep.libro_id = l.enlace
         WHERE ep.usuario_id = :correo`,
        { replacements: { correo }, type: sequelize.QueryTypes.SELECT }
      );
      return libros;
    } catch (error) {
      console.error('Error al obtener libros en proceso:', error);
      throw new Error('Error al obtener libros en proceso');
    }
  };

  
module.exports = { Libro, obtenerLibrosPorTematica , obtenerLibrosEnProcesoPorUsuario};
