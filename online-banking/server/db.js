const Pool = require('pg').Pool;
require('dotenv').config();

const pool = new Pool({
    connectionString: 'postgres://postgres:jusstsdk@localhost:5432/online-banking' || process.env.POSTGRES_URL + "?sslmode=require"
})


module.exports = pool
