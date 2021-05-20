var PROJECT_DIR = process.env.PROJECT_DIR  
var database_util = require(PROJECT_DIR + '/src/app/lib/sql_functions.js')
var data_models = require(PROJECT_DIR + '/src/app/lib/user_class.js')
var secrets = require(PROJECT_DIR + '/src/app/config/secrets')

var internal_error_msg = "Internal server error has occured. Please try again later and if the problem has not been resolved, please contact support"
   

//Display Hellow World
module.exports.hello_world = function(req, res){
    res.send("Hello World")
} 

//Display home page
module.exports.homePage = async function(req, res){
    try{
        //create a new connection to the database
        var conn = await database_util.connectdb(secrets.DB_HOST, secrets.DB_USER, secrets.DB_PASSWORD, secrets.DB_NAME)
        
        //create a new instance of a user object
        var user = new data_models.User(conn)

        //get the auth_cookie_id
        var auth_cookie_id = req.cookies.auth_id
        
        //verify the user
        var valid_cookie = await user.valid_auth_cookie(auth_cookie_id)

        

        if (valid_cookie){
            authenticated = true

            await user.create_from_cookie(auth_cookie_id)

            var responce_data = {}
            responce_data.authenticated = authenticated
            responce_data.user_data = user.get_all_user_data()


            res.status(200)
            res.render(PROJECT_DIR + "/src/app/static/views/templates/index.html", {data: responce_data})

        } else {
            var authenticated = false
            var responce_data = {}
            responce_data.authenticated = authenticated

            res.status(200)
            res.render(PROJECT_DIR + "/src/app/static/views/templates/index.html", {data: responce_data})
        }
        

    } catch(e){
        console.log(e)
        res.send(500)
    }
}

//Display register page
module.exports.registerPage = async function(req, res){
    try{
        //create a new connection to the database
        var conn = await database_util.connectdb(secrets.DB_HOST, secrets.DB_USER, secrets.DB_PASSWORD, secrets.DB_NAME)
        
        //create a new instance of a user object
        var user = new data_models.User(conn)

        //get the auth_cookie_id
        var auth_cookie_id = req.cookies.auth_id
        
        //verify the user
        var valid_cookie = await user.valid_auth_cookie(auth_cookie_id)

        //redirect to dashboard if already authenticated
        if (valid_cookie){
            
            //redirect to dashboard
            res.redirect('/dashboard')
            return
        }

        res.status(200)
        res.render(PROJECT_DIR + "/src/app/static/views/templates/register.html", {data: {authenticated: false}})

    } catch(e){
        console.log(e)
        res.send(500)
    }
}

 //Display login page
module.exports.loginPage = async function(req, res){
    try{
        //create a new connection to the database
        var conn = await database_util.connectdb(secrets.DB_HOST, secrets.DB_USER, secrets.DB_PASSWORD, secrets.DB_NAME)
        
        //create a new instance of a user object
        var user = new data_models.User(conn)

        //get the auth_cookie_id
        var auth_cookie_id = req.cookies.auth_id
        
        //verify the user
        var valid_cookie = await user.valid_auth_cookie(auth_cookie_id)

        //redirect to dashboard if already authenticated
        if (valid_cookie){
            //redirect to dashboard
            res.redirect('/dashboard')
            return
        }

        res.status(200)
        res.render(PROJECT_DIR + "/src/app/static/views/templates/login.html", {data: {authenticated: false}})

    } catch(e){
        console.log(e)
        res.send(500)
    }
}

 //Display dashboard
 module.exports.dashboard_page = async function(req, res){
    try{
        //create a new connection to the database
        var conn = await database_util.connectdb(secrets.DB_HOST, secrets.DB_USER, secrets.DB_PASSWORD, secrets.DB_NAME)
        
        //create a new instance of a user object
        var user = new data_models.User(conn)

        //get the auth_cookie_id
        var auth_cookie_id = req.cookies.auth_id

        //verify the user
        var valid_cookie = await user.valid_auth_cookie(auth_cookie_id)

        //redirect to login if invalid auth token
        if (!valid_cookie){
            //redirect back to login
            res.redirect('/login')
            return
        }

        authenticated = true

        await user.create_from_cookie(auth_cookie_id)

        //data passed to the page for rendering
        var responce_data = {}
        responce_data.authenticated = authenticated
        responce_data.user_data = user.get_all_user_data()


        res.status(200)
        res.render(PROJECT_DIR + "/src/app/static/views/templates/dashboard.html", {data: responce_data})


    } catch(e){
        console.log(e)
        res.send(500)
    }
    
}
