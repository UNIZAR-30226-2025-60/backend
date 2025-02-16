const { DataTypes } = require("sequelize");
const { sequelize } = require("../db/db");

const User = sequelize.define("User", {
  correo: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  nombre: DataTypes.STRING,
  contrasena: DataTypes.STRING,
  }, {
    tableName: 'usuario',
    timestamps: false
});

// Función para registrar un usuario
const registrarUser = async (user) => {
  try {
    const result = await User.create(user);
    return { rows: [result.get({plain: true})] };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = { User, registrarUser };
