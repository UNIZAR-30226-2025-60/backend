const { DataTypes } = require("sequelize");
const { sequelize } = require("../db/db");

const Opinion = sequelize.define('Opinion', {
    usuario_id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true, // Parte de la clave primaria
        references: {
            model: 'usuario', // Nombre de la tabla relacionada
            key: 'correo'
        }
    },
    libro_id: {
        type: DataTypes.TEXT,
        allowNull: false,
        primaryKey: true, // Parte de la clave primaria
        references: {
            model: 'libro', // Nombre de la tabla relacionada
            key: 'enlace'
        }
    },
    fecha: {
        type: DataTypes.DATE,
        allowNull: false,
        primaryKey: true, // Parte de la clave primaria
        defaultValue: DataTypes.NOW
    },
    titulo_resena: {
        type: DataTypes.STRING,
        allowNull: true
    },
    mensaje: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    valor: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    }
}, {
    tableName: 'opinion',  // Nombre exacto de la tabla en la base de datos
    schema: 'public',      // Asegúrate de que Sequelize busque en el esquema correcto
    timestamps: false,     // No generar automáticamente createdAt y updatedAt
    freezeTableName: true  // Evita que Sequelize pluralice el nombre de la tabla
});

module.exports = { Opinion };
