const PROJECT_DIR = process.env.PROJECT_DIR  
const database_util = require(PROJECT_DIR + '/src/app/lib/sql_functions.js')
const secrets = require(PROJECT_DIR + '/src/app/config/secrets')
const flight_class = require(PROJECT_DIR + '/src/app/lib/flight_class.js')
const config = require(PROJECT_DIR + '/src/app/config/common.js') 
const data_verifier = require(PROJECT_DIR + '/src/app/lib/data_verification.js')

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