var PROJECT_DIR = process.env.PROJECT_DIR                           //load the project dir from env variables (set in .envrc)

var config = require(PROJECT_DIR + '/src/app/config/common')        //load the main config file
var secrets = require(PROJECT_DIR + '/src/app/config/secrets')      //load allof the secrets
var colours = require(PROJECT_DIR + '/src/app/util/colours')        //load colour schemes to use with console.log()
var argv = require('yargs/yargs')(process.argv.slice(2)).argv       //load and parse the command line arguments

const express = require('express')                                  //express is a web framework that I will be using
const http  = require("http")                                       //http module is required to deal with http requests
const https = require('https')                                      //https module is required to deal with https requests
const fs = require('fs')

const expressLayout = require("express-ejs-layouts")
const cookieParser = require('cookie-parser');



var SSL_DISABLED = true

if (argv.d != "true"){
    var SSL_DISABLED = false

    var privateKey = fs.readFileSync(secrets.SSL_KEY);
    var certificate = fs.readFileSync(secrets.SSL_CERT);

    var ssl_creds = {
        key: privateKey,
        cert: certificate
    }
} 



//// INITIAL CLI CONFIG ////

//if a valid mode arg was passed set it as the RUN_MODE
// -m stands for mode (dev, prod), -p stands for the http port, -s stands for the https port
if (argv.m == "dev" || argv.m == "prod"){
    var RUN_MODE = argv.m
    console.log(colours.FgYellow, `RUN_MODE set to ${RUN_MODE} (using CLI Args)`)

//if no args passed or they are invalid then use the default from common.js config
} else if (config.DEFAULT_MODE == "dev" || config.DEFAULT_MODE == "prod"){
    var RUN_MODE = config.DEFAULT_MODE
    console.log(colours.FgGreen, `RUN_MODE set to ${RUN_MODE} (default)`)

//if nothing valid was passed and nothing valid loaded from config then stop the programm
} else {
    console.log(colours.FgRed, "Wasn't able to identify RUM_MODE (dev or prod)")
    console.log(colours.FgRed, "Stopping execution")
    process.exit(1)
}

//load appropriate config based on RUN_MODE
if (RUN_MODE == "dev"){
    config = Object.assign({}, config, require(PROJECT_DIR + "/src/app/config/dev"))
} else if (RUN_MODE == "prod"){
    config = Object.assign({}, config, require(PROJECT_DIR + "/src/app/config/prod"))
} else {
    console.log(FgRed, "Couldn't load RUN_MODE specific config. Exiting...")
    process.exit(1)
}

//if a valid http port was passed then 
if (argv.p != undefined && typeof argv.p == "number"){
    config.HTTP_PORT = argv.p
    console.log(colours.FgYellow, `HTTP port ${config.HTTP_PORT} set from CLI`)
} else {
    console.log(colours.FgGreen, `HTTP port ${config.HTTP_PORT} set from config`)
}

//if a valid https port was passed then
if (argv.s != undefined && typeof argv.s == "number"){
    config.HTTPS_PORT = argv.s
    console.log(colours.FgYellow, `HTTPS port ${config.HTTPS_PORT} set from CLI`)
} else {
    console.log(colours.FgGreen, `HTTPS port ${config.HTTPS_PORT} set from config`)
}



//initlise and express app object
const app = express()

//set Express to use ejs layouts
app.use(expressLayout)
app.set("view engine", "html")
app.engine('html', require('ejs').renderFile)
app.set('layout', 'layouts/common.ejs')
app.set('views', PROJECT_DIR + '/src/app/static/views')


//used for parsing POST data
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(express.raw())

//used for parsing cookies
app.use(cookieParser())

//load the naviagation routes
app.use(require(PROJECT_DIR + '/src/app/routes/navigation.js'))

//load the util routes
app.use(require(PROJECT_DIR + '/src/app/routes/util.js'))

//load data processing routes
app.use(require(PROJECT_DIR + '/src/app/routes/data.js'))

//api routes
app.use(require(PROJECT_DIR + '/src/app/routes/api.js'))

//handle 404
app.use(function(req, res) {
    var error_msg = "We are sorry but this page cannot be found. ☹️"
    var page_data = {authenticated: false, error_body: error_msg}
    res.status(400);
    res.render(PROJECT_DIR + "/src/app/static/views/templates/error.html", {data: page_data});
});

if (!SSL_DISABLED){
    const https_server = https.createServer(ssl_creds, app)

    //listen for requests on the https port
    https_server.listen(config.HTTPS_PORT)

    console.log(colours.FgGreen, "Started the HTTPS Server")

    //creating an http server
    const http_server = http.createServer((req, res) => {
        redirect_url = 'https://www.habdash.org' + req.url;
        res.writeHead(301,{Location: redirect_url});
        res.end();
    });

    //listen for requests on the http port
    http_server.listen(config.HTTP_PORT)

    console.log(colours.FgCyan, "Redirecting http -> https")



} else{
    console.log(colours.FgMagenta, "HTTPs Server is disabled")

    //creating an http webserver
    const http_server = http.createServer(app)

    //listen for requests on the http port
    http_server.listen(config.HTTP_PORT)

    console.log(colours.FgGreen, "Started the HTTP Server")
}


