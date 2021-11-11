var PROJECT_DIR = process.env.PROJECT_DIR  

const bcrypt = require ('bcrypt');

var database_util = require(PROJECT_DIR + '/src/app/lib/sql_functions.js')
var data_models = require(PROJECT_DIR + '/src/app/lib/user_class.js')
var secrets = require(PROJECT_DIR + '/src/app/config/secrets')

const email_re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ 


//process user register request
module.exports.registerNewUser = async function(req, res){
    //salt rounds for bcrypt
    const saltRounds = 10;

    var errors = []

    try{
        //hash the password
        var pass_hash = await bcrypt.hash(req.body.password, saltRounds)


        /// ### Verify Data ### ///

        //check that that passwords match
        if (req.body.password != req.body.password2) {
            errors.push("Passwords don't match")
        }

        //check that all required fields are filled in
        if (req.body.name == undefined || req.body.surname == undefined || req.body.email == undefined || req.body.password == undefined) {
            errors.push("Not all required fields are filled in")
        }

        //check that email is an email
        if (!email_re.test(String(req.body.email).toLowerCase())){
            errors.push("Not a valid email")
        }


        //create a new connection to the database
        var conn = await database_util.connectdb(secrets.DB_HOST, secrets.DB_USER, secrets.DB_PASSWORD, secrets.DB_NAME)

        //start the db transaction
        await conn.awaitBeginTransaction()

        //check if the user exists
        var user_exists = await database_util.user_exists(conn, req.body.email)

        if (user_exists) {
            errors.push("User with this email allready exists")
        }

        //respond with error messages if there are errors
        if (errors.length != 0) {
            //finish db transaction and close the connection
            await conn.awaitCommit()

            //prep the responce data for ajax
            var responce_data = {}
            responce_data.errors = errors
            responce_data.msg = ""

            //send the errors back
            res.send(responce_data)
            return
        }


        //create a new instance of a user object
        var user = new data_models.User(conn)

        //fill in the info about the user
        user.create_new(req.body.name, req.body.surname, req.body.email, pass_hash)

        //gen new cookie id
        await user.gen_cookie_id()
        
        //create a new record for the new user in the db
        await user.write_data()
        
        //save all db changes
        await conn.awaitCommit()


        //prep the responce data for ajax
        var responce_data = {}
        responce_data.errors = errors
        responce_data.msg = "Successully created a new account!"

        //set the id auth cookie
        res.cookie("auth_id", user.cookie_id, {expires: new Date(user.cookie_expiration), httpOnly: true, sameSite: "Lax"})

        //send back to dashboard
        res.send(responce_data)


    } catch(e) {
        if (e.message == "DBConnectionError") {
            console.log("This is a DB connection error")
        }

        if (e.message == "UserExistsError") {
            console.log("Error occured while checking if a user exists")
        }

        if (e.message == "GenCookieIdError"){
            console.log("Error occured while generating new cookie id")
        }

        if (e.message == "WriteDataError"){
            console.log("Error occured while creating a record for the new user in the db")
        }

        console.log(e)

        var responce_data = {}
        responce_data.errors = ["Internal server error has occured. Please try again later and if the problem has not been resolved, please contact support"]
        
        res.send(responce_data)

    } finally {
        //close the connection
        conn.awaitEnd()
    }
 }



 //process user login request
module.exports.loginUser = async function(req, res){
    //salt rounds for bcrypt
    const saltRounds = 10; 
    
    var errors = []


    try{
        /// ### Verify Data ### ///

        //check that all required fields are filled in
        if (req.body.email == undefined || req.body.password == undefined) {
            errors.push("Not all required fields are filled in")
        }

        //check that email is an email
        if (!email_re.test(String(req.body.email).toLowerCase())){
            errors.push("Not a valid email")
        }

        //create a new connection to the database
        var conn = await database_util.connectdb(secrets.DB_HOST, secrets.DB_USER, secrets.DB_PASSWORD, secrets.DB_NAME)

        //start the db transaction
        await conn.awaitBeginTransaction()

        //check if the user exists
        var user_exists = await database_util.user_exists(conn, req.body.email)

        if (!user_exists) {
            errors.push("Either you email or password are incorrect. Make sure you have created a HABDash account and try again")
        }

        //respond with error messages if there are errors
        if (errors.length != 0) {
            await conn.awaitCommit()


            //prep the responce data for ajax
            var responce_data = {}
            responce_data.errors = errors
            responce_data.msg = ""

            //send the errors back
            res.send(responce_data)
            return
        }

        //create a new instance of a user object
        var user = new data_models.User(conn)

        //create new user instance by querying the db with the provided email
        await user.create_from_email(req.body.email)

        //validate password against db hash
        var valid_user = await user.validate_password(req.body.password)

        //respond with error if not a valid user
        if(!valid_user){
            errors.push("Either you email or password are incorrect. Make sure you have created a HABDash account and try again")

            //prep the responce data for ajax
            var responce_data = {}
            responce_data.errors = errors
            responce_data.msg = ""

            //send the errors back
            res.send(responce_data)
            return
        }

        //generate auth cookie id
        await user.gen_cookie_id()
        
        //set a short expiration time for user cookie if they don't want to be remembered
        if(req.body.rem_me == undefined){
            //calculate cookie expiration time
            user.cookie_expiration = new Date()
            user.cookie_expiration.setDate(user.cookie_expiration.getDate() + 1)
            user.cookie_expiration = user.cookie_expiration.toISOString().replace(/T/, ' ').replace(/\..+/, '') 
        }

        //write the new cookie to the db
        await user.write_new_cookie()

        //save all db changes
        await conn.awaitCommit()

        //set cookie with different expiration time based on if remmember me was clicked
        if(req.body.rem_me == "true"){
            //set the id auth cookie
            res.cookie("auth_id", user.cookie_id, {expires: new Date(user.cookie_expiration), httpOnly: true, sameSite: "Lax"})
        } else {
            res.cookie("auth_id", user.cookie_id, {httpOnly: true, sameSite: "Lax"})
        }

        //prep the responce data for ajax
        var responce_data = {}
        responce_data.errors = errors
        responce_data.msg = "Successully created a new account!"

        //redirect back to dashboard
        res.send(responce_data)



    } catch(e){
        if (e.message == "DBConnectionError") {
            console.log("This is a DB connection error")
        }

        if (e.message == "UserExistsError") {
            console.log("Error occured while checking if a user exists")
        }

        if (e.message == "CreateByEmailError"){
            console.log("Error while creating a user object from email")
        }
        
        console.log(e)
        
        var responce_data = {}
        responce_data.errors = ["Internal server error has occured. Please try again later and if the problem has not been resolved, please contact support"]
        
        res.send(responce_data)
    } finally {
        //close the connection
        conn.awaitEnd()
    }
    
 }


 module.exports.logoutUser = async function(req, res){
     try{
         //create a new connection to the database
        var conn = await database_util.connectdb(secrets.DB_HOST, secrets.DB_USER, secrets.DB_PASSWORD, secrets.DB_NAME)

        //start the db transaction
        await conn.awaitBeginTransaction()

        //get the auth_cookie_id
        var auth_cookie_id = req.cookies.auth_id

        //remove cookie from the DB
        await database_util.remove_cookie_record(conn, auth_cookie_id)

        //save all db changes
        await conn.awaitCommit()
        
        //remove coookie from the request
        res.clearCookie("auth_id", {httpOnly: true, sameSite: "Lax"});

        res.send({"logged_out": true})


     }catch(e){
         console.log(e)
         res.send({"logged_out": false})
         
     } finally {
        //close the connection
        conn.awaitEnd()
     }

 }

 module.exports.add_flight = async function(req, res){
    try {
        var responce_data = {};
        responce_data.errors = []

        var field_orders = []

        var allowed_field_types = ["str", "int", "float"]

        // get payload from request
        var payload_doc = req.body;

        

        //check that flight_name field exists
        if (payload_doc.flight_name == undefined || payload_doc.flight_name == "" || payload_doc.flight_name == null) {
            responce_data.errors.push("'flight_name' is empty or undefined")
        }

        // check datatype of flight_name
        if (typeof payload_doc.flight_name != "string"){
            responce_data.errors.push("'flight_name' is not a string")
        }

        // check that lat_field_name exists
        if (payload_doc.lat_field_name == undefined || payload_doc.lat_field_name == "" || payload_doc.lat_field_name == null) {
            responce_data.errors.push("'lat_field_name' is empty or undefined")
        }

        // check datatype of lat_field_name
        if (typeof payload_doc.lat_field_name != "string"){
            responce_data.errors.push("'lat_field_name' is not a string")
        }

        // check that lon_field_name exists
        if (payload_doc.lon_field_name == undefined || payload_doc.lon_field_name == "" || payload_doc.lon_field_name == null) {
            responce_data.errors.push("'lon_field_name' is empty or undefined")
        }

        // check datatype of lon_field_name
        if (typeof payload_doc.lon_field_name != "string"){
            responce_data.errors.push("'lon_field_name' is not a string")   
        }

        // check that fields is an array and is longer than 0
        if (payload_doc.fields.constructor !== Array || payload_doc.fields.length == 0) {
            responce_data.errors.push("'fields' is not an array or is empty")

        } else {
            // for each item in the array that its an object
            for (i in payload_doc.fields){
                // check that its an object
                if (typeof payload_doc.fields[i] != "object"){
                    responce_data.errors.push(`Item ${i} in fields is not an object`)

                } else {
                    // check that object has field_name
                    if (payload_doc.fields[i].field_name == undefined || payload_doc.fields[i].field_name == "" || payload_doc.fields[i].field_name == null) {
                        responce_data.errors.push(`Item ${i} in fields doesn't have 'field_name'`)

                    //check that field_name is a string
                    } else if (typeof payload_doc.fields[i].field_name != "string"){
                        responce_data.errors.push(`field_name of item ${i} in fields is not a string`)
                    }

                    // check that object has field_type
                    if (payload_doc.fields[i].field_type == undefined || payload_doc.fields[i].field_type == "" || payload_doc.fields[i].field_type == null) {
                        responce_data.errors.push(`Item ${i} in fields doesn't have 'field_type'`)

                    // check that field_type is a string
                    } else if (typeof payload_doc.fields[i].field_type != "string"){
                        responce_data.errors.push(`field_type of item ${i} in fields is not a string`)
                    
                    // check that field_type is one of the allowed values
                    } else if (allowed_field_types.includes(payload_doc.fields[i].field_type) == false){
                        responce_data.errors.push(`field_type of item ${i} in fields is not one of the allowed values`)
                    }

                    // check that chart_data is boolean
                    if (typeof payload_doc.fields[i].chart_data != "boolean"){
                        responce_data.errors.push(`chart_data of item ${i} in fields is not a boolean or undefined`)
                    }

                    // check that object has field_order
                    if (payload_doc.fields[i].field_order == undefined || payload_doc.fields[i].field_order == null) {
                        responce_data.errors.push(`Item ${i} in fields doesn't have 'field_order'`)
                        console.log(payload_doc.fields[i].field_order)

                    // check that field_order is an integer
                    } else if (typeof payload_doc.fields[i].field_order != "number"){
                        responce_data.errors.push(`field_order of item ${i} in fields is not an integer`)
                    
                    //add field_order to list of field orders and check that its unique
                    } else {
                        if (field_orders.includes(payload_doc.fields[i].field_order)){
                            responce_data.errors.push(`field_order of item ${i} in fields is not unique`)
                        }
                        
                        field_orders.push(payload_doc.fields[i].field_order)

                    }


                }

            }

        }

        console.log(payload_doc.flight_name)
        console.log(typeof payload_doc.flight_name)
        
        if (responce_data.errors.length != 0){
            res.status(406)
        } else {
            res.status(200)
        }
        
        res.send(responce_data)

    } catch(e){
        console.log(e)

        responce_data.errors = ["Internal server error has occured. Please try again later and if the problem has not been resolved, please contact support"] 

        res.status(500)

        res.send(responce_data)

    }

 }

    // } finally {
    //     //conn.awaitEnd()
    // }