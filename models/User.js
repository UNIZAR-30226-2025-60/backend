// const { DataTypes } = require("sequelize");
// const { sequelize } = require("../db/db");

// const User = sequelize.define("User", {
//   googleId: {
//     type: DataTypes.STRING,
//     unique: true,
//   },
//   displayName: DataTypes.STRING,
//   email: DataTypes.STRING,
// });

// module.exports = User;

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

module.exports = User;
