var PROJECT_DIR = process.env.PROJECT_DIR     

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
module.exports.loginPage = function(req, res){
    res.render(PROJECT_DIR + "/src/app/static/views/templates/login.html", {show_navlogin: false})
}
