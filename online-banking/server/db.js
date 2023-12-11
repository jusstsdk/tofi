const Pool = require('pg').Pool;

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "online-banking",
    password: "jusstsdk",
    port: 5432
})

module.exports = pool
