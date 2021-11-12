var PROJECT_DIR = process.env.PROJECT_DIR

var database_util = require(PROJECT_DIR + '/src/app/lib/sql_functions.js')
var secrets = require(PROJECT_DIR + '/src/app/config/secrets')

const bcrypt = require ('bcrypt');

//class representing the user data
module.exports.User = class {
    constructor(db_conn){
        this.db_conn = db_conn
        this.time_now = new Date().toISOString()
    }

    create_new(first_name, last_name, email, pass_hash){
        this.first_name = first_name
        this.last_name = last_name
        this.email = email
        this.pass_hash = pass_hash

        this.date_created = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') 

        this.gen_cookie_expiration_date()

    }

    async gen_cookie_id() {
        try {
            var saltRounds = 10
            var id_string = this.name + this.email + this.time_now
            this.cookie_id = await bcrypt.hash(id_string, saltRounds)

        } catch(e){
            console.log(e)
            throw new Error("GenCookieIdError")
        }
    }

    gen_cookie_expiration_date(){
        //calculate cookie expiration time
        this.cookie_expiration = new Date()
        this.cookie_expiration.setMonth(this.cookie_expiration.getMonth() + 1)
        this.cookie_expiration = this.cookie_expiration.toISOString().replace(/T/, ' ').replace(/\..+/, '') 
    }

    async write_data(){
        try{
            await database_util.save_new_user_data(this.db_conn, this.first_name, this.last_name, this.email, this.pass_hash, this.date_created)
            this.UID = await database_util.get_last_UID(this.db_conn)
            await database_util.add_auth_cookie(this.db_conn, this.cookie_id, this.UID, this.cookie_expiration)

        } catch(e){
            console.log(e)
            throw new Error("WriteDataError")
        }
    }

    async create_from_email(email){
        try{
            result = await database_util.get_data_by_email(this.db_conn, email)
            this.data = result[0]

            this.first_name = this.data.FirstName
            this.last_name = this.data.LastName
            this.email = this.data.Email
            this.pass_hash = this.data.PassHash
            this.date_created = this.data.DateCreated
            this.last_logon = this.data.LastLogon
            this.UID = this.data.UID

            this.gen_cookie_expiration_date()


        } catch(e){
            console.log(e)
            throw new Error("CreateByEmailError")
        }
    }

    async create_from_cookie(cookie_id){
        try{
            user_data = await database_util.get_data_by_cookieid(this.db_conn, cookie_id)
            this.first_name = user_data.FirstName
            this.last_name = user_data.LastName
            this.email = user_data.Email
            this.pass_hash = user_data.PassHash
            this.date_created = user_data.DateCreated
            this.last_logon = user_data.last_logon
            this.UID = user_data.UID
            this.cookie_expiration = user_data.ExpirationDate.toISOString().replace(/T/, ' ').replace(/\..+/, '') 

        } catch(e){
            console.log(e)
            throw new Error("CreateFromCookieError")
        }
    }

    async valid_auth_cookie(cookie_id){
        try{
            var cookie_data = await database_util.check_auth_cookie(this.db_conn, cookie_id)

            if (cookie_data == undefined){
                return false
            } else {
                return true
            }

        } catch(e){
            console.log(e)
            throw new Error("CookieValidationError")
        }
    }

    async validate_password(challange_pass){
        try{
            return await bcrypt.compare(challange_pass, this.pass_hash)
        } catch(e){
            console.log(e)
            throw new Error("PassValidationError")
        }
    }

    async write_new_cookie(){
        try{
            await database_util.add_auth_cookie(this.db_conn, this.cookie_id, this.UID, this.cookie_expiration)
        } catch(e){
            console.log(e)
            throw new Error("CookieDBError")
        }
    }

    get_all_user_data(){
        var user_data = {}

        user_data.first_name = this.first_name 
        user_data.last_name = this.last_name 
        user_data.email = this.email 
        user_data.date_created = this.date_created 
        user_data.last_logon = this.last_logon 

        return user_data
    }
    
    async get_flights(){
        try{
            return await database_util.get_user_flights(this.db_conn, this.UID)

        } catch(e){
            console.log(e)
            throw new Error("GetUserFlightsError")
        }
    }

    async insert_new_flight(flight_config){
        try{
            await database_util.new_flight_record(this.db_conn, this.UID, flight_config.flight_name, flight_config.description, flight_config.lat_field_name, flight_config.lon_field_name)
            
        } catch(e){
            console.log(e)
            throw new Error("InsertNewFlightError")
        }
    }

    async remove_flight_config(flight_name){
        try{
            await database_util.remove_flight_config(this.db_conn, flight_name)

        } catch(e){
            console.log(e)
            throw new Error("RemoveFlightConfigError")
        }
    }

    async update_flight_config(flight_config){
        try{
                
            //remove previous flight config
            await this.remove_flight_config(flight_config.flight_name)

            //add new flight config
            await database_util.add_flight_config(this.db_conn, flight_config)

            
        } catch(e){
            console.log(e)
            throw new Error("AddFlightConfigError")
        }

    }
    

}