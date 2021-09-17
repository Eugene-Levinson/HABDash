var PROJECT_DIR = process.env.PROJECT_DIR  
var database_util = require(PROJECT_DIR + '/src/app/lib/sql_functions.js')
var flight_model = require(PROJECT_DIR + '/src/app/lib/flight_class.js')
var secrets = require(PROJECT_DIR + '/src/app/config/secrets')

//returns some flight data
module.exports.get_flight_data = async function(req, res){
    try{
        //create a new connection to the database
        var conn = await database_util.connectdb(secrets.DB_HOST, secrets.DB_USER, secrets.DB_PASSWORD, secrets.DB_NAME)
        var flight = new flight_model.Flight(conn, req.params.flightname)

        var flight_data = await flight.get_flight_info(flight.flight_name)

        if (flight_data == null){
            conn.awaitEnd()
            
            res.status(404)
            res.send("No such flight found")
            return
        }

        res.status(200)
        res.setHeader('content-type', 'application/json');
        res.send(flight_data)
        

    } catch(e){
        console.log(e)
        res.send(500)

    } finally {
        //close the connection
        conn.awaitEnd()
    }
}