import mysql from "mysql2/promise";

export const db = await mysql.createConnection({
    // host: "host.docker.internal",
    host: "localhost",
    user: "root",
    password: "easybot",
    database: "mps400"
});