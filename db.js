const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '91689168', // Add your MySQL password here if you have one
    database: 'SIULibrary',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Convert pool to promise-based
const promisePool = pool.promise();

module.exports = promisePool;