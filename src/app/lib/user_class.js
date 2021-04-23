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

        this.gen_cookie_expiration_date()

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


        } catch(e){
            console.log(e)
            throw new Error("CreateByEmailError")
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
    

}