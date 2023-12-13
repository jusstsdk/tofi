const Pool = require('pg').Pool;
require('dotenv').config();


// const pool = new Pool({
//     user: process.env.DB_USER || "postgres",
//     host: process.env.DB_HOST || "localhost",
//     database: process.env.DB_NAME || "online-banking",
//     password: process.env.DB_PASSWORD || "jusstsdk",
//     port: process.env.DB_PORT || 5432
// })

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL + "?sslmode=require"
})

module.exports = pool
