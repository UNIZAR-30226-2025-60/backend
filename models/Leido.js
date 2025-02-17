const { DataTypes } = require("sequelize");
const { sequelize } = require("../db/db");

const Leido = sequelize.define('Leido', {
    usuario_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'usuario', // Relacionado con la tabla `USUARIO`
            key: 'correo'
        },
        onDelete: 'CASCADE'  // Si el usuario es eliminado, se elimina la relación
    },
    libro_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'libro', // Relacionado con la tabla `LIBRO`
            key: 'enlace'
        },
        onDelete: 'CASCADE'  // Si el libro es eliminado, se elimina la relación
    },
    fecha_fin_lectura: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,  // Establece la fecha de finalización de la lectura al momento de la creación
    }
}, {
    tableName: 'leidos',  // Nombre exacto de la tabla
    timestamps: false,    // No generar automáticamente createdAt y updatedAt
    freezeTableName: true // Evita que Sequelize pluralice el nombre de la tabla
});

const obtenerLibrosLeidosPorUsuario = async (correo) => {
    try {
        // Consulta SQL cruda para obtener los libros leídos por un usuario
        const query = `
            SELECT l.*
            FROM "leidos" AS le
            JOIN "libro" AS l ON le."libro_id" = l."enlace"
            WHERE le."usuario_id" = :correo
        `;

        // Ejecutamos la consulta con el parámetro 'correo'
        const librosLeidos = await sequelize.query(query, {
            replacements: { correo },
            type: sequelize.QueryTypes.SELECT
        });

        return librosLeidos;

    } catch (error) {
        console.error("Error al obtener libros leídos:", error);
        throw new Error('Error al obtener libros leídos');
    }
};

module.exports = { Leido, obtenerLibrosLeidosPorUsuario };
