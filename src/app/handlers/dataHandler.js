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
            errors.push("User allready exists")
        }

        //respond with error messages if there are errors
        if (errors.length != 0) {
            await conn.awaitCommit()
            conn.awaitEnd()

            res.status(409)
            res.send(errors)
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

        //close the connection
        conn.awaitEnd()


        //set the id auth cookie
        res.cookie("auth_id", user.cookie_id, {expires: new Date(user.cookie_expiration), httpOnly: true, sameSite: "Lax"})

        //set status
        res.status(200)

        //send the responce
        res.send("You have successfully registered a new HABDash account! You can now login")



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

        if (e.message == "UserExistsError"){
            console.log("Error occured while creating a record for the new user in the db")
        }

        console.log(e)
        
        res.send(500)
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
            conn.awaitEnd()

            res.status(409)
            res.send(errors)
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
            res.status(200)
            res.send(errors)
            return
        }

        //generate auth cookie id
        await user.gen_cookie_id()
        
        //set a short expiration time for user cookie if they don't want to be remembered
        if(req.body.rm == undefined){
            //calculate cookie expiration time
            user.cookie_expiration = new Date()
            user.cookie_expiration.setDate(user.cookie_expiration.getDate() + 1)
            user.cookie_expiration = user.cookie_expiration.toISOString().replace(/T/, ' ').replace(/\..+/, '') 
        }

        //write the new cookie to the db
        await user.write_new_cookie()

        //save all db changes
        await conn.awaitCommit()

        //close the connection
        conn.awaitEnd()

        //set cookie with different expiration time based on if remmember me was clicked
        if(req.body.rm != undefined){
            //set the id auth cookie
            res.cookie("auth_id", user.cookie_id, {expires: new Date(user.cookie_expiration), httpOnly: true, sameSite: "Lax"})
        } else {
            res.cookie("auth_id", user.cookie_id, {httpOnly: true, sameSite: "Lax"})
        }


        res.status(200)
        res.send(`Hello, ${user.first_name}! Welcome to HABDash, your account creation date is: ${user.date_created}`)



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
        res.send(500)
    }
    
 }