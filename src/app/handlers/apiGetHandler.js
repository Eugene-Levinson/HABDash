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
            
            res.status(404)
            res.send({})
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

//returns raw flight telem
module.exports.get_raw_flight_data = async function(req, res){
    try{
        //create a new connection to the database
        var conn = await database_util.connectdb(secrets.DB_HOST, secrets.DB_USER, secrets.DB_PASSWORD, secrets.DB_NAME)
        var flight = new flight_model.Flight(conn, req.params.flightname)

        var flight_data = await flight.get_raw_data(flight.flight_name)

        if (flight_data == null){
            
            res.setHeader('content-type', 'application/json');
            res.status(200)
            res.send({})
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

//returns parsed flight data
module.exports.get_parsed_flight_data = async function(req, res){
    try{
        //create a new connection to the database
        var conn = await database_util.connectdb(secrets.DB_HOST, secrets.DB_USER, secrets.DB_PASSWORD, secrets.DB_NAME)
        var flight = new flight_model.Flight(conn, req.params.flightname)

        var flight_data = await flight.get_parsed_data(flight.flight_name)

        if (flight_data == null){
            
            res.setHeader('content-type', 'application/json');
            res.status(200)
            res.send({})
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