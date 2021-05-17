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
   res.render(PROJECT_DIR + "/src/app/static/views/templates/index.html", {show_navlogin: true})
}

//Display register page
module.exports.registerPage = function(req, res){
    res.render(PROJECT_DIR + "/src/app/static/views/templates/register.html", {show_navlogin: false})
}

 //Display login page
module.exports.loginPage = async function(req, res){
    res.render(PROJECT_DIR + "/src/app/static/views/templates/login.html", {show_navlogin: false})
}
