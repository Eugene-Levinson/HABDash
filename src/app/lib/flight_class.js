var PROJECT_DIR = process.env.PROJECT_DIR
var database_util = require(PROJECT_DIR + '/src/app/lib/sql_functions.js')
const config = require(PROJECT_DIR + '/src/app/config/common.js')

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

    async parse_telem_string(telem, data_fields){
        try{
            let telem_string = telem.replace(config.TELEM_PREFIX, "")
            let telem_list = telem_string.split(config.TELEM_SEP)

            //check telem string matches the length of data fields
            if (telem_string.lenght != telem_list.lenght){
                return {"ok": false, "data":"Couldn't parse - telem string doesn't match payload doc"}
            }

            //transform data fields into list
            let dict_data_list = []
            for (i in data_fields){

                // add db datatype fieled
                if (data_fields[i]["field_type"] == "int"){
                    data_fields[i]["db_field_type"] = "INT"

                } else if (data_fields[i]["field_type"] == "float"){
                    data_fields[i]["db_field_type"] = "FLOAT"

                } else {
                    data_fields[i]["db_field_type"] = "VARCHAR(255)"  
                }

                data_fields[i]["value"] = telem_list[i]

                //push to dict
                dict_data_list.push(data_fields[i])
            }

            //fill data fields with data
            return {"ok": true, "data": dict_data_list}


        } catch(e){
            console.log(e)
            throw new Error("DataParsingError")
            
        }
    }

    async gen_queries(parsed_telem, table_name){
        try{
            let colums = []
            let c_types = []
            let values = []

            for (i in parsed_telem){
                colums.push((parsed_telem[i]["field_name"]).replace(" ", "_"))
                c_types.push(parsed_telem[i]["db_field_type"])

                if (parsed_telem[i]["db_field_type"] == "VARCHAR(255)"){
                    values.push(`'${parsed_telem[i]['value']}'`)
                } else {
                    values.push(`${parsed_telem[i]['value']}`)
                }
                
            }

            //gen the make table query
            let make_table_q = await database_util.gen_make_table_query(this.db_conn, table_name, colums, c_types)

            let insert_data_query = await database_util.gen_insert_data_query(this.db_conn, colums, values, table_name)

            return [make_table_q, insert_data_query]

        } catch(e){
            console.log(e)
            throw new Error("QueryGenerationError")
            
        }


    }


}
