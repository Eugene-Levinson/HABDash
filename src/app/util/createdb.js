var PROJECT_DIR = process.env.PROJECT_DIR   
var secrets = require(PROJECT_DIR + '/src/app/config/secrets')
var mysql = require('mysql')

//load inline paramter values 
//use -n to set the name of the database to be created
var argv = require('yargs/yargs')(process.argv.slice(2)).argv


//function to connect to the mysql server
async function connectdb(dbhost, dbuser, pass){
    creds = {
            host: dbhost,
            user: dbuser,
            password: pass
            }

    //create a connection object
    var con = mysql.createConnection(creds)
    
    try{
        //connect to the db
        await con.connect()

    } catch(e){console.log(e)}

    return con    
}

//function to create a database
async function createdb(con, name){

    try {
        con.query("CREATE DATABASE " + name)
        console.log("Successfully created database " + name)

    } catch(e){console.log(e)}

    
}

//function to send some general sql
async function sendsql(con, some_sql){
    try {
        con.query(some_sql)

    } catch(e){console.log(e)}
}

async function generate_tables(con){
    //create the users table and the cookies table
    try {
        sql_code = `CREATE TABLE Users (
            UID int NOT NULL AUTO_INCREMENT,
            FirstName varchar(255),
            LastName varchar(255),
            Email varchar(255),
            PassHash varchar(255),
            DateCreated DATETIME,
            LastLogon DATETIME,
            PRIMARY KEY (UID)
        );`

        await sendsql(con, sql_code)
        console.log("Created 'Users' table")

        sql_code = `CREATE TABLE Cookies (
            CookieID varchar(255),
            UID int NOT NULL,
            ExpirationDate DATETIME,
            FOREIGN KEY (UID) REFERENCES Users(UID)
        );`

        await sendsql(con, sql_code)
        console.log("Created 'Cookies' table")

        sql_code = `CREATE TABLE flights (
            flight_name varchar(255),
            user_uid int NOT NULL,
            description varchar(255),
            last_edited DATETIME,
            last_data_entry DATETIME,
            lat_field_name varchar(255),
            lon_field_name varchar(255),
            time_stamp_field varchar(255),
            FOREIGN KEY (user_uid) REFERENCES Users(UID)
        );`

        await sendsql(con, sql_code)
        console.log("Created 'flights' table")

        sql_code = `CREATE TABLE raw_flight_data (
            flight_name varchar(255),
            date_added DATETIME,
            data varchar(255)
        );`

        await sendsql(con, sql_code)
        console.log("Created 'raw_flight_data' table")

        sql_code = `CREATE TABLE data_fields (
            flight_name varchar(255),
            field_name varchar(255),
            field_type varchar(255),
            field_order varchar(255),
            chart_data BIT
        );`

        await sendsql(con, sql_code)
        console.log("Created 'data_field' table")

        sql_code = `CREATE TABLE parse_log (
            log_uid int NOT NULL AUTO_INCREMENT,
            flight_name varchar(255),
            log_type varchar(255),
            time_stamp DATETIME,
            msg varchar(255),
            PRIMARY KEY (log_uid)
        );`

        await sendsql(con, sql_code)
        console.log("Created 'parse_log' table")



    } catch(e){console.log(e)}
}


//main function
async function main(){

    var db_name = argv.n

    //try to connect to the SQL server
    try {
        var con = await connectdb(secrets.DB_HOST, secrets.DB_USER, secrets.DB_PASSWORD)
        console.log("Connected to the SQL server")

    } catch(e){console.log(e)}

    //create a new database for the project
    try {
        await createdb(con, db_name)

    } catch(e){console.log(e)}

    //select the database
    try{
        await sendsql(con, "USE " + db_name)

    } catch(e){console.log(e)}


    //generate the tables
    try{
        await generate_tables(con)

    } catch(e){console.log(e)}

    con.end()



}

main()
