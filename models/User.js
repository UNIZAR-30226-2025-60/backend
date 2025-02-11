const { DataTypes } = require("sequelize");
const { sequelize } = require("../db/db");

const User = sequelize.define("User", {
  googleId: {
    type: DataTypes.STRING,
    unique: true,
  },
  displayName: DataTypes.STRING,
  email: DataTypes.STRING,
});

module.exports = User;
