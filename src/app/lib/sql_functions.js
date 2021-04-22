var PROJECT_DIR = process.env.PROJECT_DIR  
var secrets = require(PROJECT_DIR + '/src/app/config/secrets')

//var mysql = require('mysql')
const mysql = require(`mysql-await`);

//function to connect to the mysql server
async function connectdb(dbhost, dbuser, pass, db_name){
    creds = {
            host: dbhost,
            user: dbuser,
            password: pass,
            database: db_name
            }

    try{
        //create a connection object
        var conn = mysql.createConnection(creds)
        
        return conn 

    } catch(e){
        console.log(e)
        throw new Error("DBConnectionError")
    }   
}

async function send_sql(conn, sql_code){
    try{
        result = await conn.awaitQuery(sql_code)
        return result

    } catch(e){
        console.log(e)
        throw e
    }
}

async function user_exists(conn, email){
    try{
        sql_code = `SELECT * FROM ${secrets.DB_USER_TABLE} WHERE Email = '${email}'`
        result = await send_sql(conn, sql_code)
        
        if (result.length == 0){
            return false
        }

        return true

    } catch(e){
        throw new Error("UserExistsError")
    }
}



module.exports.connectdb = connectdb
module.exports.send_sql = send_sql
module.exports.user_exists = user_exists

