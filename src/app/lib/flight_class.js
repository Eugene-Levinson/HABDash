var PROJECT_DIR = process.env.PROJECT_DIR
var database_util = require(PROJECT_DIR + '/src/app/lib/sql_functions.js')
const config = require(PROJECT_DIR + '/src/app/config/common.js')

module.exports.Flight = class {
    constructor(db_conn, flight_name){
        this.db_conn = db_conn
        this.flight_name = flight_name
        this.table_name = this.get_parsed_table_name(this.flight_name)
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

    get_parsed_table_name(flight_name){

        return `parsed_telem_${flight_name}`
    }

    get_flight_name_col_name(data_fields){
        try{

            if (data_fields != null){
                var field = data_fields["fields"][0]
                var field_name = field["field_name"]

                field_name = field_name.replace(" ", "_")

                return field_name
            
            } else {
                return null
            }
            
        } catch(e){
            console.log(e)
            throw new Error("GetFlightNameColNameError")  
        }
    }

    async get_raw_data(flight_name){
        try{

            var raw_data = await database_util.get_raw_flight_data(this.db_conn, flight_name)

            return raw_data
        
        } catch(e){
            console.log(e)
            throw new Error("GetRawFlightData")  
        }

    }

    async get_parsed_data(flight_name){
        try{
            var field_data = await this.get_flight_info(flight_name)
            var flight_col = this.get_flight_name_col_name(field_data)

            if(field_data == null || flight_col == null){
                return null
            } else {

                var parsed_data = await database_util.get_parsed_flight_data(this.db_conn, this.table_name, flight_name, flight_col)

                return parsed_data

            }
        
        } catch(e){
            console.log(e)
            throw new Error("GetParsedFlightData")  
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

    async gen_queries(parsed_telem){
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
            let make_table_q = await database_util.gen_make_table_query(this.db_conn, this.table_name, colums, c_types)

            let insert_data_query = await database_util.gen_insert_data_query(this.db_conn, colums, values, this.table_name)

            return [make_table_q, insert_data_query]

        } catch(e){
            console.log(e)
            throw new Error("QueryGenerationError")
            
        }


    }


}

module.exports.get_parsed_table_name = function(flight_name){
    return `parsed_telem_${flight_name}`
}
