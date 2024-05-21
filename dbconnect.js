import mysql from "mysql"

const dbconnect = mysql.createConnection({
    host: "localhost",
    user: "root",
    password:"",
    database: "blood-donate"
})

export default dbconnect