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

module.exports = { Libro };
