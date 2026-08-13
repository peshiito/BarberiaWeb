import mysql from "mysql2/promise";

const pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 10,
    decimalNumbers: true,
    dateStrings: ["DATE"],
});

export default pool;
