var PROJECT_DIR = process.env.PROJECT_DIR
var database_util = require(PROJECT_DIR + '/src/app/lib/sql_functions.js')

module.exports.Flight = class {
    constructor(db_conn, flight_name){
        this.db_conn = db_conn
        this.flight_name = flight_name
    }

    async get_flight_info(flight_name) {
        try {
            var data  = await database_util.get_flight_info(this.db_conn, flight_name)
            
            if (data == "" || data == undefined || data == {}){
                return null
            }

            return data

        } catch(e){
            console.log(e)
            throw new Error("GetFlightInfoError")
        }
    }


}
