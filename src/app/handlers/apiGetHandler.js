var PROJECT_DIR = process.env.PROJECT_DIR  
var database_util = require(PROJECT_DIR + '/src/app/lib/sql_functions.js')
var data_models = require(PROJECT_DIR + '/src/app/lib/user_class.js')
var secrets = require(PROJECT_DIR + '/src/app/config/secrets')

//returns some flight data
module.exports.get_flight_data = async function(req, res){
    try{
        console.log(req.params["flightname"])
        res.status(200)
        res.send("Hello world")
        

    } catch(e){
        console.log(e)
        res.send(500)
    }
}