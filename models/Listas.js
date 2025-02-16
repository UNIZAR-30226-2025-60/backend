const { DataTypes } = require("sequelize");
const { sequelize } = require("../db/db");

const Lista = sequelize.define('Lista', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true // Parte de la clave primaria compuesta
    },
    usuario_id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true, // Parte de la clave primaria compuesta
        references: {
            model: 'usuario', // Relacionado con la tabla `USUARIO`
            key: 'correo'
        }
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    publica: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    portada: {
        type: DataTypes.TEXT,
        allowNull: true,
        references: {
            model: 'imagen', // Relacionado con la tabla `IMAGEN`
            key: 'url'
        }
    }
}, {
    tableName: 'lista',   // Nombre exacto de la tabla
    schema: 'public',     // Esquema donde se encuentra la tabla
    timestamps: false,    // No generar automáticamente createdAt y updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

module.exports = { Lista };
