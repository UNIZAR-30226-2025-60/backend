const { DataTypes } = require("sequelize");
const { sequelize } = require("../db/db");

const Fragmento = sequelize.define('DestacarFragmento', {
    enlace: {
        type: DataTypes.STRING(255),
        allowNull: false,
        primaryKey: true,  // Parte de la clave primaria compuesta
        references: {
            model: 'libro',  // Relacionado con la tabla `libro`
            key: 'enlace'
        },
        onDelete: 'CASCADE'
    },
    correo: {
        type: DataTypes.STRING(255),
        allowNull: false,
        primaryKey: true,  // Parte de la clave primaria compuesta
        references: {
            model: 'usuario',  // Relacionado con la tabla `usuario`
            key: 'correo'
        },
        onDelete: 'CASCADE'
    },
    pagina: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true  // Parte de la clave primaria compuesta
    }
}, {
    tableName: 'destacar_fragmento',  // Nombre exacto de la tabla
    schema: 'public',                // Esquema donde se encuentra la tabla
    timestamps: false,               // No generar automáticamente createdAt y updatedAt
    freezeTableName: true            // Evita que Sequelize pluralice el nombre de la tabla
});

module.exports = { Fragmento };
