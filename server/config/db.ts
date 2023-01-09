import mysql from "mysql"

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "enery_current",
})

export default db
