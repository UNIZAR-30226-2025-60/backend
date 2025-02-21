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
        const query = `
            SELECT l.*
            FROM "leidos" AS le
            JOIN "libro" AS l ON le."libro_id" = l."enlace"
            WHERE le."usuario_id" = :correo
        `;

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

// Modificamos la función para que reciba el mes y el año
const obtenerEstadisticasLibrosLeidosEnMes = async (correo, year, month) => {
    try {
        // Definir el primer y último día del mes recibido
        const fechaInicioMes = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0)); // El mes es 0-indexado, por eso restamos 1
        const fechaFinMes = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)); // Último día del mes

        console.log('Fecha inicio mes:', fechaInicioMes);
        console.log('Fecha fin mes:', fechaFinMes);

        const query = `
            SELECT l.*, t.tematica, le.fecha_fin_lectura
            FROM "leidos" AS le
            JOIN "libro" AS l ON le."libro_id" = l."enlace"
            JOIN "tema_asociado" AS ta ON l."enlace" = ta."enlace"
            JOIN "tema" AS t ON ta."tematica" = t."tematica"
            WHERE le."usuario_id" = :correo
            AND le."fecha_fin_lectura" BETWEEN :fechaInicio AND :fechaFin
        `;

        const librosLeidos = await sequelize.query(query, {
            replacements: { correo, fechaInicio: fechaInicioMes, fechaFin: fechaFinMes },
            type: sequelize.QueryTypes.SELECT
        });

        console.log('Libros Leídos:', librosLeidos); 

        if (librosLeidos.length === 0) {
            return { mensaje: "No se encontraron libros leídos en este mes.", totalLibrosLeidos: 0, tematicas: {}, librosLeidos: [] };
        }

        const tematicas = {};
        const librosUnicos = [];

        librosLeidos.forEach(libro => {
            const tematica = libro.tematica;
            
            if (!librosUnicos.some(l => l.enlace === libro.enlace)) {
                librosUnicos.push(libro);
            }

            if (tematica) {  
                if (tematicas[tematica]) {
                    tematicas[tematica] += 1;
                } else {
                    tematicas[tematica] = 1;
                }
            }
        });

        console.log('Temáticas:', tematicas); 
        console.log('Libros Únicos:', librosUnicos); 

        return {
            totalLibrosLeidos: librosUnicos.length, 
            tematicas,
            librosLeidos: librosUnicos 
        };

    } catch (error) {
        console.error('Error al obtener los libros leídos en el mes:', error);
        throw new Error('Error al obtener los libros leídos en el mes');
    }
};



const obtenerEstadisticasLibrosLeidosEnAños = async (correo, year) => {
    try {
        console.log(`Obteniendo estadísticas para el usuario: ${correo} y el año: ${year}`);
        
        const queryLibrosCompletados = `
            SELECT COUNT(*) AS libros_completados
            FROM "leidos" AS le
            WHERE le."usuario_id" = :correo
            AND DATE(le."fecha_fin_lectura") <= CURRENT_DATE
            AND EXTRACT(YEAR FROM le."fecha_fin_lectura") = :year
        `;
        
        const resultLibrosCompletados = await sequelize.query(queryLibrosCompletados, {
            replacements: { correo, year },
            type: sequelize.QueryTypes.SELECT
        });

        const libros_completados = resultLibrosCompletados[0]?.libros_completados || 0;
        console.log('Libros completados:', libros_completados);

        const queryLibrosEnProgreso = `
            SELECT COUNT(*) AS libros_en_progreso
            FROM "en_proceso" AS ep
            WHERE ep."usuario_id" = :correo
            AND EXTRACT(YEAR FROM CURRENT_DATE) = :year
        `;
        
        const resultLibrosEnProgreso = await sequelize.query(queryLibrosEnProgreso, {
            replacements: { correo, year },
            type: sequelize.QueryTypes.SELECT
        });

        const libros_en_progreso = resultLibrosEnProgreso[0]?.libros_en_progreso || 0;
        console.log('Libros en progreso:', libros_en_progreso);

        const queryTematicasMasLeidas = `
            SELECT t.tematica, COUNT(*) AS cantidad
            FROM "leidos" AS le
            JOIN "libro" AS l ON le."libro_id" = l."enlace"
            JOIN "tema_asociado" AS ta ON l."enlace" = ta."enlace"
            JOIN "tema" AS t ON ta."tematica" = t."tematica"
            WHERE le."usuario_id" = :correo
            AND EXTRACT(YEAR FROM le."fecha_fin_lectura") = :year
            GROUP BY t.tematica
            ORDER BY cantidad DESC
            LIMIT 3
        `;
        
        const tematicasMasLeidas = await sequelize.query(queryTematicasMasLeidas, {
            replacements: { correo, year },
            type: sequelize.QueryTypes.SELECT
        });
        console.log('Temáticas más leídas:', tematicasMasLeidas);

        const queryLibrosMasValorados = `
            SELECT l.*, AVG(o.valor) AS puntuacion_media
            FROM "opinion" AS o
            JOIN "libro" AS l ON o."libro_id" = l."enlace"
            JOIN "tema_asociado" AS ta ON l."enlace" = ta."enlace"
            JOIN "tema" AS t ON ta."tematica" = t."tematica"
            WHERE o."usuario_id" = :correo
            AND EXTRACT(YEAR FROM o."fecha") = :year
            GROUP BY l."enlace", t.tematica
            ORDER BY AVG(o.valor) DESC
            LIMIT 5
        `;
        
        const librosMasValorados = await sequelize.query(queryLibrosMasValorados, {
            replacements: { correo, year },
            type: sequelize.QueryTypes.SELECT
        });
        console.log('Libros más valorados:', librosMasValorados);

        const queryLibrosLeidos = `
            SELECT l.*
            FROM "leidos" AS le
            JOIN "libro" AS l ON le."libro_id" = l."enlace"
            WHERE le."usuario_id" = :correo
            AND EXTRACT(YEAR FROM le."fecha_fin_lectura") = :year
        `;
        
        const librosLeidos = await sequelize.query(queryLibrosLeidos, {
            replacements: { correo, year },
            type: sequelize.QueryTypes.SELECT
        });
        console.log('Libros leídos:', librosLeidos);

        return {
            libros_completados,
            libros_en_progreso,
            tematicasMasLeidas: tematicasMasLeidas || [],
            librosMasValorados: librosMasValorados || [],
            librosLeidos: librosLeidos || []  
        };

    } catch (error) {
        console.error('Error al obtener las estadísticas de libros leídos:', error);
        throw new Error('Error al obtener las estadísticas de libros leídos en el año');
    }
};

const obtenerTop3UsuariosDelMes = async () => {
    try {
        const queryTop3Usuarios = `
            SELECT le."usuario_id", COUNT(*) AS libros_leidos
            FROM "leidos" AS le
            WHERE EXTRACT(MONTH FROM le."fecha_fin_lectura") = EXTRACT(MONTH FROM CURRENT_DATE)
            AND EXTRACT(YEAR FROM le."fecha_fin_lectura") = EXTRACT(YEAR FROM CURRENT_DATE)
            GROUP BY le."usuario_id"
            ORDER BY libros_leidos DESC
            LIMIT 3;
        `;
        
        const usuariosTop3 = await sequelize.query(queryTop3Usuarios, {
            type: sequelize.QueryTypes.SELECT
        });
        console.log('Top 3 usuarios que más han leído este mes:', usuariosTop3);

        return usuariosTop3;

    } catch (error) {
        console.error('Error al obtener los 3 usuarios que más han leído del mes:', error);
        throw new Error('Error al obtener los 3 usuarios que más han leído del mes');
    }
};

const obtenerTop15LibrosDelMesYAnio = async (month, year) => {
    try {
        const queryTop15Libros = `
            SELECT l.*, COUNT(*) AS veces_leido
            FROM "leidos" AS le
            JOIN "libro" AS l ON le."libro_id" = l."enlace"
            WHERE EXTRACT(MONTH FROM le."fecha_fin_lectura") = :month
            AND EXTRACT(YEAR FROM le."fecha_fin_lectura") = :year
            GROUP BY l."enlace"
            ORDER BY veces_leido DESC
            LIMIT 15;
        `;
        
        const librosTop15 = await sequelize.query(queryTop15Libros, {
            replacements: { month, year },
            type: sequelize.QueryTypes.SELECT
        });
        console.log('Top 15 libros más leídos:', librosTop15);

        return librosTop15;

    } catch (error) {
        console.error('Error al obtener los 15 libros más leídos del mes y año:', error);
        throw new Error('Error al obtener los 15 libros más leídos del mes y año');
    }
};

const obtenerTop15LibrosDelAnio = async (year) => {
    try {
        const queryTop15LibrosAnio = `
            SELECT l.*, COUNT(*) AS veces_leido
            FROM "leidos" AS le
            JOIN "libro" AS l ON le."libro_id" = l."enlace"
            WHERE EXTRACT(YEAR FROM le."fecha_fin_lectura") = :year
            GROUP BY l."enlace"
            ORDER BY veces_leido DESC
            LIMIT 15;
        `;
        
        const librosTop15Anio = await sequelize.query(queryTop15LibrosAnio, {
            replacements: { year },
            type: sequelize.QueryTypes.SELECT
        });
        console.log('Top 15 libros más leídos del año:', librosTop15Anio);

        return librosTop15Anio;

    } catch (error) {
        console.error('Error al obtener los 15 libros más leídos del año:', error);
        throw new Error('Error al obtener los 15 libros más leídos del año');
    }
};

// ESTO ES EL TIEMPO COGIDO DE UN LIBRO, NO TIENE QUE VER CON EL TIEMPO INVERTIDO DE UN USUARIO
const obtenerTiempoTotalLeidoEnMes = async (correo, year, month) => {
    // try {
    //     // Calcular la fecha de inicio y fin del mes
    //     const fechaInicioMes = new Date(year, month, 1, 0, 0, 0); // Primer día del mes
    //     const fechaFinMes = new Date(year, month + 1, 0, 23, 59, 59); // Último día del mes

    //     // Consulta para obtener las horas leídas en ese mes
    //     const query = `
    //         SELECT SUM(l.horas_lectura) AS tiempo_total_lectura
    //         FROM "leidos" AS le
    //         JOIN "libro" AS l ON le."libro_id" = l."enlace"
    //         WHERE le."usuario_id" = :correo
    //         AND le."fecha_fin_lectura" BETWEEN :fechaInicio AND :fechaFin
    //     `;

    //     const resultado = await sequelize.query(query, {
    //         replacements: { correo, fechaInicio: fechaInicioMes, fechaFin: fechaFinMes },
    //         type: sequelize.QueryTypes.SELECT
    //     });

    //     const tiempoTotalLectura = resultado[0]?.tiempo_total_lectura || 0; 
    //     return Number(tiempoTotalLectura);

    // } catch (error) {
    //     console.error('Error al obtener el tiempo total leído en el mes:', error);
    //     throw new Error('Error al obtener el tiempo total leído en el mes');
    // }
};


module.exports = { Leido, obtenerLibrosLeidosPorUsuario, obtenerEstadisticasLibrosLeidosEnMes, obtenerEstadisticasLibrosLeidosEnAños, obtenerTop3UsuariosDelMes, obtenerTop15LibrosDelMesYAnio, obtenerTop15LibrosDelAnio, obtenerTiempoTotalLeidoEnMes };
