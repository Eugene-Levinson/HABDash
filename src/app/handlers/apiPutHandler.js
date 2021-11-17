const PROJECT_DIR = process.env.PROJECT_DIR  
const database_util = require(PROJECT_DIR + '/src/app/lib/sql_functions.js')
const secrets = require(PROJECT_DIR + '/src/app/config/secrets')
const flight_class = require(PROJECT_DIR + '/src/app/lib/flight_class.js')
const config = require(PROJECT_DIR + '/src/app/config/common.js') 
const data_verifier = require(PROJECT_DIR + '/src/app/lib/data_verification.js')
var data_models = require(PROJECT_DIR + '/src/app/lib/user_class.js')

module.exports.telem_reciever = async function(req, res){
    try{
        //create a new connection to the database
        var conn = await database_util.connectdb(secrets.DB_HOST, secrets.DB_USER, secrets.DB_PASSWORD, secrets.DB_NAME)
        
        data_verifier.verify_raw_data(req.query.telem)

        //get the flight name - assume format
        let telem = req.query.telem
        let telem_data = telem.replace(config.TELEM_PREFIX, "")
        let flight_name = telem_data.split(config.TELEM_SEP)[0]

        //generate instance if the flight class
        let flight_object = new flight_class.Flight(conn, flight_name)

        //write raw telem
        await database_util.write_raw_telem(conn, flight_name, telem)

        //get flight config
        try{

            var flight_info = await flight_object.get_flight_info(flight_name)
            var flight_datafields = flight_info["fields"]

        } catch(e){
            throw new Error("NoFlightConfig")
        }


        let parsed_responce = await flight_object.parse_telem_string(telem, flight_datafields)
        let parsed_telem = parsed_responce["data"]


        let telem_table_queries = await flight_object.gen_queries(parsed_telem)

        //run the queries
        for (q in telem_table_queries){
            await database_util.send_sql(conn, telem_table_queries[q])
        }

        res.status(200)
        res.send("ok")
        

    } catch(e){
        if (e.message == "TelemIsUndefined"){
            res.status(400)
            res.send("The telemtry you submitted was either null or undefined")

        } else if (e.message == "NoFlightConfig"){
            res.status(400)
            res.send("No Flight config present - could not parse data")
        
        } else {
            console.log(e)
            res.send(500)
        }
        
    } finally{
        conn.awaitEnd()
    }

}


module.exports.edit_flight = async function(req, res){
    try{
        var responce_data = {};
        responce_data.errors = []

        //create a new connection to the database
        var conn = await database_util.connectdb(secrets.DB_HOST, secrets.DB_USER, secrets.DB_PASSWORD, secrets.DB_NAME)
        
        //create a new instance of a user object
        var user = new data_models.User(conn)

        //get the auth_cookie_id
        var auth_cookie_id = req.cookies.auth_id
        
        //verify the user
        var valid_cookie = await user.valid_auth_cookie(auth_cookie_id)
        
        //check that you are authed
        if (!valid_cookie) {
            responce_data.errors.push("You are not logged in")
            res.status(401)
            res.send(responce_data)

            return
        }

        var flight_doc = req.body
        var req_flight_name = req.params.flightname

        // create user object from auth_cookie_id
        await user.create_from_cookie(auth_cookie_id)

        var user_flights = await user.get_flights()

        //check that the user owns the flight
        if (!user_flights.includes(req_flight_name)){
            responce_data.errors.push("You do not own this flight or it does not exists")

            res.status(404)
            res.send(responce_data)
            return
        }

        // validate flight_doc
        var flight_doc_errors = data_verifier.verify_flight_config(flight_doc)

        if (flight_doc_errors.errors.length > 0){
            responce_data = flight_doc_errors
            console.log(flight_doc_errors)
        }

        console.log(responce_data.errors)

        //check that flight doc name matches the flight in the url
        if (flight_doc["flight_name"] != req_flight_name){
            responce_data.errors.push(`The flight name in your new payload doc '${flight_doc["flight_name"]}'' does not match the name of the flight that you are trying to edit '${req_flight_name}'.`)
            res.status(406)
            res.send(responce_data)

            return
        }

        console.log(responce_data.errors)

        //check if there are any errors
        if (responce_data.errors.length > 0){
            res.status(406)

        } else {
            console.log("no errors")
            //start the db transaction
            await conn.awaitBeginTransaction()

            //add or update flight config
            await user.update_flight_config(flight_doc)


            // commit db changes
            await conn.awaitCommit()

            res.status(200)
        }

        res.send(responce_data)
        

    } catch(e){
        console.log(e)
        res.send(500)
        
    } finally{
        conn.awaitEnd()
    }

}