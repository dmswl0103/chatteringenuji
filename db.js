
const mysql = require('mysql');

const conn = mysql.createConnection({
    host: 'localhost',
    user: 'dmswl',
    password: '202301513pw',
    database: 'chatdb' // 데베 이름 
});

conn.connect((err) => {
    if (err) console.log(err);
    else console.log('Connected to the database');
});

module.exports = conn;
