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
        sql_code = `SELECT * FROM ${secrets.DB_USER_TABLE} WHERE Email = ${conn.escape(email)}`
        result = await send_sql(conn, sql_code)
        
        if (result.length == 0){
            return false
        }

        return true

    } catch(e){
        console.log(e)
        throw new Error("UserExistsError")
    }
}

async function get_last_UID(conn){
    try {
        sql_code = "SELECT LAST_INSERT_ID()"
        var last_UID = await send_sql(conn, sql_code)

        return last_UID[0]["LAST_INSERT_ID()"]
    
    } catch(e){
        console.log(e)
        throw new Error("LastUIDError")
    }

}

async function save_new_user_data(conn, first_name, last_name,
                                email, pass_hash, date_created) {
    try {
        //create a user record
        var sql_code = `INSERT INTO ${secrets.DB_USER_TABLE} (FirstName, LastName, Email, PassHash, DateCreated)
                        VALUES (${conn.escape(first_name)}, ${conn.escape(last_name)}, 
                        ${conn.escape(email)}, ${conn.escape(pass_hash)}, ${conn.escape(date_created)})`

        await send_sql(conn, sql_code)

    } catch(e){
        console.log(e)
        throw new Error("SaveUserDataError")
    }

}

async function add_auth_cookie(conn, cookie_id, UID, cookie_expiration){

    try {
    
        //create a cookie record for the user -> same cookie to be set during the responce
        sql_code = `INSERT INTO ${secrets.DB_COOKIE_TABLE} (CookieID, UID, ExpirationDate)
                    VALUES (${conn.escape(cookie_id)}, ${conn.escape(UID)}, ${conn.escape(cookie_expiration)})`

        await send_sql(conn, sql_code)

    } catch(e){
        console.log(e)
        throw new Error("CookieIDInsertError")
    }
}

async function get_data_by_email(conn, email){

    try{

        //fetch the data based on the email
        sql_code = `SELECT * FROM Users WHERE Email=${conn.escape(email)}`
        result = await send_sql(conn, sql_code)
        return result

    } catch(e){
        console.log(e)
        throw new Error("GetDataByEmailError")
    }
    
}

async function get_data_by_cookieid(conn, cookie_id){
    try{
        sql_code = `SELECT * FROM Cookies WHERE CookieID=${conn.escape(cookie_id)};`
        cookie_data = await send_sql(conn, sql_code)
        cookie_data = cookie_data[0]
        uid = cookie_data.UID

        sql_code = `SELECT * FROM Users WHERE UID=${conn.escape(uid)};`
        user_data = await send_sql(conn, sql_code)  
        user_data = user_data[0]

        user_data = Object.assign({}, cookie_data, user_data)

        return user_data

    } catch(e){
        console.log(e)
        throw new Error("GetDataByCookieIDError")
    }
}

async function check_auth_cookie(conn, cookie_id){
    try{
        sql_code = `SELECT * FROM Cookies WHERE CookieID=${conn.escape(cookie_id)};`
        result = await send_sql(conn, sql_code)
        return result[0]

    } catch(e){
        console.log(e)
        throw new Error("CheckAuthCookie")
    }
}

async function remove_cookie_record(conn, cookie_id){
    try{
        sql_code = `DELETE FROM Cookies WHERE CookieID=${conn.escape(cookie_id)}`
        result = await send_sql(conn, sql_code)

    } catch(e){
        console.log(e)
        throw new Error("RemovingUserData")
    }
}

async function get_user_flights(conn, user_uid){
    try{
        sql_code = `SELECT * FROM flights WHERE user_uid=${conn.escape(user_uid)}`
        result = await send_sql(conn, sql_code)

        var flights = []

        for (entry in result){
            flights.push(result[entry].flight_name)
        }

        return flights
     
    } catch(e){
        console.log(e)
        throw new Error("GetUserFlightsError")
    }
}

async function check_flight_exists(conn, flight_name){
    try{
        let sql_code = `SELECT * FROM flights WHERE flight_name=${conn.escape(flight_name)}`
        let result = await send_sql(conn, sql_code)

        if (result.length == 0){
            return false
        } else {
            return true
        }

    } catch {
        console.log(e)
        throw new Error ("CheckFlightExistsError")
    }
}

async function get_flight_info(conn, flight_name){
    try{
        var sql_code = `SELECT * FROM flights WHERE flight_name=${conn.escape(flight_name)}`
        var flight_setup_data = await send_sql(conn, sql_code)

        sql_code = `SELECT * FROM data_fields WHERE flight_name=${conn.escape(flight_name)}`
        var flight_field_data = await send_sql(conn, sql_code)

        sql_code = `SELECT * FROM raw_flight_data WHERE flight_name=${conn.escape(flight_name)} ORDER BY date_added DESC`
        var raw_data = await send_sql(conn, sql_code)

        if (flight_setup_data == "" || flight_setup_data == undefined || flight_setup_data == {}){
            return null
        }

        for (i in flight_field_data){
            flight_field_data[i].chart_data = flight_field_data[i].chart_data.readUIntLE()

            //console.log(flight_field_data[i]["flight_name"])
        }

        //combine the json together
        var combined_data = flight_setup_data[0]
        combined_data.fields = flight_field_data
        combined_data.raw_flight_data = raw_data
        
        //return flight_data
        return combined_data
    
    } catch(e){
        console.log(e)
        throw new Error("GetUserFlightsError")
    }
}

async function write_raw_telem(conn, flight_name, telem_string){
    try{
        var date_now = new Date().toISOString().slice(0, 19).replace('T', ' ');

        var sql_code = `INSERT INTO raw_flight_data (flight_name, date_added, data) VALUES (${conn.escape(flight_name)}, "${date_now}", ${conn.escape(telem_string)})`

        await send_sql(conn, sql_code)

    } catch(e){
        console.log(e)
        throw new Error("RecordTelemDataError")
    }
}




module.exports.connectdb = connectdb
module.exports.send_sql = send_sql
module.exports.user_exists = user_exists
module.exports.save_new_user_data = save_new_user_data
module.exports.get_last_UID = get_last_UID
module.exports.add_auth_cookie = add_auth_cookie
module.exports.get_data_by_email = get_data_by_email
module.exports.get_data_by_cookieid = get_data_by_cookieid
module.exports.check_auth_cookie = check_auth_cookie
module.exports.remove_cookie_record = remove_cookie_record
module.exports.get_user_flights = get_user_flights
module.exports.get_flight_info = get_flight_info
module.exports.write_raw_telem = write_raw_telem
module.exports.check_flight_exists = check_flight_exists
