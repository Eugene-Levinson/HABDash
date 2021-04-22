var PROJECT_DIR = process.env.PROJECT_DIR

var database_util = require(PROJECT_DIR + '/src/app/lib/sql_functions.js')
var secrets = require(PROJECT_DIR + '/src/app/config/secrets')

const bcrypt = require ('bcrypt');

//class representing the user data
module.exports.User = class {
    constructor(db_conn){
        this.db_conn = db_conn
    }

    create_new(first_name, last_name, email, pass_hash){
        this.first_name = first_name
        this.last_name = last_name
        this.email = email
        this.pass_hash = pass_hash

        this.date_created = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') 

        //console.log(this.first_name, this.last_name, this.email, this.pass_hash, this.date_created)
    }

    async gen_cookie_id() {
        try {
            var saltRounds = 10
            var id_string = this.name + this.email + this.date_created
            this.cookie_id = await bcrypt.hash(id_string, saltRounds)

        } catch(e){
            console.log(e)
            throw new Error("GenCookieIdError")
        }
    }

    async write_data(){
        try{
            //create a user record
            var sql_code = `INSERT INTO ${secrets.DB_USER_TABLE} (FirstName, LastName, Email, PassHash, DateCreated)
                            VALUES ('${this.first_name}', '${this.last_name}', '${this.email}', '${this.pass_hash}', '${this.date_created}')`


            await database_util.send_sql(this.db_conn, sql_code)

            //calculate cookie expiration time
            this.cookie_expiration = new Date()
            this.cookie_expiration.setMonth(this.cookie_expiration.getMonth() + 1)
            this.cookie_expiration = this.cookie_expiration.toISOString().replace(/T/, ' ').replace(/\..+/, '') 

            //get the UID of the current user
            sql_code = "SELECT LAST_INSERT_ID()"
            var last_UID = await database_util.send_sql(this.db_conn, sql_code)
            this.UID = last_UID[0]["LAST_INSERT_ID()"]

            //create a cookie record for the user -> same cookie to be set during the responce
            sql_code = `INSERT INTO ${secrets.DB_COOKIE_TABLE} (CookieID, UID, ExpirationDate)
                        VALUES ('${this.cookie_id}', ${this.UID}, '${this.cookie_expiration}')`

            await database_util.send_sql(this.db_conn, sql_code)



        } catch(e){
            console.log(e)
            throw new Error("WriteDataError")
        }
    }
    

}