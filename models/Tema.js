const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../db/db");  // Asegúrate de tener la conexión correctamente establecida

// Definición del modelo Tema
const Tema = sequelize.define("Tema", {
  tematica: {
    type: DataTypes.STRING(100),
    allowNull: false,
    primaryKey: true,  // Clave primaria
  }
}, {
  // Opciones del modelo
  tableName: "tema",  // Nombre de la tabla en la base de datos
  timestamps: false,  // Desactivar las columnas createdAt y updatedAt si no las necesitas
});

// Exportar el modelo
module.exports = { Tema };
