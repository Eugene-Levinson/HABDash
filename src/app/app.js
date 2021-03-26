var PROJECT_DIR = process.env.PROJECT_DIR                           //load the project dir from env variables (set in .envrc)

var config = require(PROJECT_DIR + '/src/app/config/common')        //load the main config file
var colours = require(PROJECT_DIR + '/src/app/util/colours')        //load colour schemes to use with console.log()
var argv = require('yargs/yargs')(process.argv.slice(2)).argv       //load and parse the command line arguments

const express = require('express')                                  //express is a web framework that I will be using
const http  = require("http")                                       //http module is required to deal with http requests


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

//load the routes from seperate files and pass them to express to use
app.use(require(PROJECT_DIR + '/src/app/routes/navigation.js'))

//creating an http webserver
const http_server = http.createServer(app)

//listen for requests on the http port
http_server.listen(config.HTTP_PORT)


