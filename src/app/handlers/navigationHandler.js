var PROJECT_DIR = process.env.PROJECT_DIR  
var database_util = require(PROJECT_DIR + '/src/app/lib/sql_functions.js')
var data_models = require(PROJECT_DIR + '/src/app/lib/user_class.js')
var secrets = require(PROJECT_DIR + '/src/app/config/secrets')
   

//Display Hellow World
module.exports.hello_world = function(req, res){
    res.send("Hello World")
} 

//Display home page
module.exports.homePage = function(req, res){
   res.render(PROJECT_DIR + "/src/app/static/views/templates/index.html", {data: {authenticated: true}})
}

//Display register page
module.exports.registerPage = function(req, res){
    res.render(PROJECT_DIR + "/src/app/static/views/templates/register.html", {data: {authenticated: false}})
}

 //Display login page
module.exports.loginPage = async function(req, res){
    res.render(PROJECT_DIR + "/src/app/static/views/templates/login.html", {data: {authenticated: false}})
}

 //Display dashboard
 module.exports.dashboard_page = async function(req, res){
    var errors = []

    try{
        //create a new connection to the database
        var conn = await database_util.connectdb(secrets.DB_HOST, secrets.DB_USER, secrets.DB_PASSWORD, secrets.DB_NAME)
        
        //create a new instance of a user object
        var user = new data_models.User(conn)

        //get the auth_cookie_id
        var auth_cookie_id = req.cookies.auth_id

        var valid_cookie = await user.valid_auth_cookie(auth_cookie_id)


        if (!valid_cookie){
            res.status(200)
            res.send("This is not a valid user")
            return
        } 

        res.status(200)
        res.render(PROJECT_DIR + "/src/app/static/views/templates/login.html", {data: {authenticated: false}})

    } catch(e){
        res.send(500)
    }
    
}
