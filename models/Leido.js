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

const obtenerEstadisticasLibrosLeidosEnMes = async (correo, year, month) => {
    try {
        const fechaInicioMes = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0)); 
        const fechaFinMes = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)); 

        console.log('Fecha inicio mes:', fechaInicioMes);
        console.log('Fecha fin mes:', fechaFinMes);

        const query = `
            SELECT l.*, le.fecha_fin_lectura
            FROM "leidos" AS le
            JOIN "libro" AS l ON le."libro_id" = l."enlace"
            WHERE le."usuario_id" = :correo
            AND le."fecha_fin_lectura" BETWEEN :fechaInicio AND :fechaFin
        `;

        const librosLeidos = await sequelize.query(query, {
            replacements: { correo, fechaInicio: fechaInicioMes.toISOString(), fechaFin: fechaFinMes.toISOString() },
            type: sequelize.QueryTypes.SELECT
        });

        console.log('Libros Leídos:', librosLeidos); 

        if (librosLeidos.length === 0) {
            return { mensaje: "No se encontraron libros leídos en este mes.", totalLibrosLeidos: 0, librosLeidos: [] };
        }

        const totalLibrosLeidos = librosLeidos.length;

        return {
            totalLibrosLeidos,
            librosLeidos       
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
            librosLeidos: librosLeidos || []  
        };

    } catch (error) {
        console.error('Error al obtener las estadísticas de libros leídos:', error);
        throw new Error('Error al obtener las estadísticas de libros leídos en el año');
    }
};

const obtenerEstadisticasGeneralesPorUsuario = async (correo) => {
    try {
        const queryLibrosTotalesLeidos = `
            SELECT COUNT(*) AS total_libros_leidos
            FROM "leidos" AS le
            WHERE le."usuario_id" = :correo;
        `;
        const resultLibrosTotales = await sequelize.query(queryLibrosTotalesLeidos, {
            replacements: { correo },
            type: sequelize.QueryTypes.SELECT
        });

        const totalLibrosLeidos = resultLibrosTotales[0]?.total_libros_leidos || 0;

        const queryTop3Tematicas = `
            SELECT t.tematica, COUNT(*) AS cantidad
            FROM "leidos" AS le
            JOIN "libro" AS l ON le."libro_id" = l."enlace"
            JOIN "tema_asociado" AS ta ON l."enlace" = ta."enlace"
            JOIN "tema" AS t ON ta."tematica" = t."tematica"
            WHERE le."usuario_id" = :correo
            GROUP BY t.tematica
            ORDER BY cantidad DESC
            LIMIT 3;
        `;
        const tematicasMasLeidas = await sequelize.query(queryTop3Tematicas, {
            replacements: { correo },
            type: sequelize.QueryTypes.SELECT
        });

        const queryTop5LibrosValorados = `
            SELECT l.*, AVG(o.valor) AS puntuacion_media
            FROM "opinion" AS o
            JOIN "libro" AS l ON o."libro_id" = l."enlace"
            WHERE o."usuario_id" = :correo
            GROUP BY l."enlace"
            ORDER BY AVG(o.valor) DESC  -- Ordena por el cálculo de la puntuación media
            LIMIT 5;
        `;

        const librosMasValorados = await sequelize.query(queryTop5LibrosValorados, {
            replacements: { correo },
            type: sequelize.QueryTypes.SELECT
        });

        const queryLibrosEnProgreso = `
            SELECT COUNT(*) AS libros_en_progreso
            FROM "en_proceso" AS ep
            WHERE ep."usuario_id" = :correo;
        `;
        const resultLibrosEnProgreso = await sequelize.query(queryLibrosEnProgreso, {
            replacements: { correo },
            type: sequelize.QueryTypes.SELECT
        });

        const librosEnProgreso = resultLibrosEnProgreso[0]?.libros_en_progreso || 0;

        return {
            totalLibrosLeidos,
            tematicasMasLeidas,
            librosMasValorados,
            librosEnProgreso
        };
    } catch (error) {
        console.error('Error al obtener las estadísticas generales del usuario:', error);
        throw new Error('Error al obtener las estadísticas generales del usuario');
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

const obtenerTop3UsuariosDelAnio = async (year) => {
    try {
        const queryTop3UsuariosAnio = `
            SELECT le."usuario_id", COUNT(*) AS libros_leidos
            FROM "leidos" AS le
            WHERE EXTRACT(YEAR FROM le."fecha_fin_lectura") = :year
            GROUP BY le."usuario_id"
            ORDER BY libros_leidos DESC
            LIMIT 3;
        `;

        const usuariosTop3Anio = await sequelize.query(queryTop3UsuariosAnio, {
            replacements: { year },
            type: sequelize.QueryTypes.SELECT
        });

        console.log('Top 3 usuarios que más han leído este año:', usuariosTop3Anio);

        return usuariosTop3Anio;

    } catch (error) {
        console.error('Error al obtener los 3 usuarios que más han leído del año:', error);
        throw new Error('Error al obtener los 3 usuarios que más han leído del año');
    }
};

const obtenerTop5LibrosDelMesYAnio = async (month, year) => {
    try {
        const queryTop15Libros = `
            SELECT l.*, COUNT(*) AS veces_leido
            FROM "leidos" AS le
            JOIN "libro" AS l ON le."libro_id" = l."enlace"
            WHERE EXTRACT(MONTH FROM le."fecha_fin_lectura") = :month
            AND EXTRACT(YEAR FROM le."fecha_fin_lectura") = :year
            GROUP BY l."enlace"
            ORDER BY veces_leido DESC
            LIMIT 5;
        `;
        
        const librosTop15 = await sequelize.query(queryTop15Libros, {
            replacements: { month, year },
            type: sequelize.QueryTypes.SELECT
        });
        console.log('Top 5 libros más leídos:', librosTop15);

        return librosTop15;

    } catch (error) {
        console.error('Error al obtener los 5 libros más leídos del mes y año:', error);
        throw new Error('Error al obtener los 5 libros más leídos del mes y año');
    }
};

const obtenerTop5LibrosDelAnio = async (year) => {
    try {
        const queryTop15LibrosAnio = `
            SELECT l.*, COUNT(*) AS veces_leido
            FROM "leidos" AS le
            JOIN "libro" AS l ON le."libro_id" = l."enlace"
            WHERE EXTRACT(YEAR FROM le."fecha_fin_lectura") = :year
            GROUP BY l."enlace"
            ORDER BY veces_leido DESC
            LIMIT 5;
        `;
        
        const librosTop15Anio = await sequelize.query(queryTop15LibrosAnio, {
            replacements: { year },
            type: sequelize.QueryTypes.SELECT
        });
        console.log('Top 5 libros más leídos del año:', librosTop15Anio);

        return librosTop15Anio;

    } catch (error) {
        console.error('Error al obtener los 5 libros más leídos del año:', error);
        throw new Error('Error al obtener los 5 libros más leídos del año');
    }
};

const obtenerLibrosRecomendadosSegunTematicas = async (correo) => {
    try {
        const queryTematicas = `
            WITH tematicas_mas_leidas AS (
                SELECT t.tematica
                FROM "leidos" AS le
                JOIN "libro" AS l ON le."libro_id" = l."enlace"
                JOIN "tema_asociado" AS ta ON l."enlace" = ta."enlace"
                JOIN "tema" AS t ON ta."tematica" = t."tematica"
                WHERE le."usuario_id" = :correo
                GROUP BY t.tematica
                ORDER BY COUNT(*) DESC
                LIMIT 3
            )
            SELECT l.*, AVG(o.valor) AS puntuacion_media, COUNT(DISTINCT t.tematica) AS coincidencias_tematicas
            FROM "libro" AS l
            JOIN "tema_asociado" AS ta ON l."enlace" = ta."enlace"
            JOIN "tema" AS t ON ta."tematica" = t."tematica"
            LEFT JOIN "opinion" AS o ON o."libro_id" = l."enlace"
            WHERE t.tematica IN (SELECT tematica FROM tematicas_mas_leidas)
            AND l."enlace" NOT IN (
                SELECT "libro_id"
                FROM "leidos"
                WHERE "usuario_id" = :correo
                UNION
                SELECT "libro_id"
                FROM "en_proceso"
                WHERE "usuario_id" = :correo
            )
            GROUP BY l."enlace"
            ORDER BY coincidencias_tematicas DESC, AVG(o.valor) DESC
            LIMIT 10;
        `;
        
        const librosRecomendados = await sequelize.query(queryTematicas, {
            replacements: { correo },
            type: sequelize.QueryTypes.SELECT
        });

        console.log('Libros recomendados:', librosRecomendados);

        return librosRecomendados;
    } catch (error) {
        console.error('Error al obtener libros recomendados:', error);
        throw new Error('Error al obtener libros recomendados');
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


module.exports = { Leido, obtenerLibrosLeidosPorUsuario, obtenerEstadisticasLibrosLeidosEnMes, obtenerTop3UsuariosDelAnio, obtenerEstadisticasGeneralesPorUsuario, obtenerEstadisticasLibrosLeidosEnAños, obtenerTop3UsuariosDelMes, obtenerTop5LibrosDelMesYAnio, obtenerTop5LibrosDelAnio, obtenerLibrosRecomendadosSegunTematicas, obtenerTiempoTotalLeidoEnMes };
