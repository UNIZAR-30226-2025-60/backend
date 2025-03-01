const { Sequelize } = require('sequelize');
const { Pool } = require('pg');
require('dotenv').config();
// SI DESDE BACKEND
// require('dotenv').config();
// SI DESDE FRONTEND
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const DATABASE_URL = process.env.DATABASE_URL;

const sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,    
        },
    },
    logging: console.log, // Activa logs de Sequelize
});


// const pool = new Pool({
//     connectionString: DATABASE_URL,
//     ssl: { rejectUnauthorized: false }
// });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

  
module.exports = {sequelize, pool };
