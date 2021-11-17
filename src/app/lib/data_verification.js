module.exports.verify_raw_data = function (telem) {
    //check if null or undefined
    if (telem == undefined || telem == null || telem == ""){
        throw new Error("TelemIsUndefined")
    }
}

module.exports.verify_flight_config = function (payload_doc) {

    var field_orders = []
    var allowed_field_types = ["str", "int", "float"]

    var responce_data = {};
    responce_data.errors = []

    //check that flight_name field exists
    if (payload_doc.flight_name == undefined || payload_doc.flight_name == "" || payload_doc.flight_name == null) {
        responce_data.errors.push("'flight_name' is empty or undefined")


    // check datatype of flight_name
    } else if (typeof payload_doc.flight_name != "string"){
        responce_data.errors.push("'flight_name' is not a string")
    
    }


    // check that lat_field_name exists
    if (payload_doc.lat_field_name == undefined || payload_doc.lat_field_name == "" || payload_doc.lat_field_name == null) {
        responce_data.errors.push("'lat_field_name' is empty or undefined")
    }

    // check datatype of lat_field_name
    if (typeof payload_doc.lat_field_name != "string"){
        responce_data.errors.push("'lat_field_name' is not a string")
    }

    // check that lon_field_name exists
    if (payload_doc.lon_field_name == undefined || payload_doc.lon_field_name == "" || payload_doc.lon_field_name == null) {
        responce_data.errors.push("'lon_field_name' is empty or undefined")
    }

    // check datatype of lon_field_name
    if (typeof payload_doc.lon_field_name != "string"){
        responce_data.errors.push("'lon_field_name' is not a string")   
    }

    // check that fields is an array and is longer than 0
    if (payload_doc.fields.constructor !== Array || payload_doc.fields.length == 0) {
        responce_data.errors.push("'fields' is not an array or is empty")

    } else {
        // for each item in the array that its an object
        for (i in payload_doc.fields){
            // check that its an object
            if (typeof payload_doc.fields[i] != "object"){
                responce_data.errors.push(`Item ${i} in fields is not an object`)

            } else {
                // check that object has field_name
                if (payload_doc.fields[i].field_name == undefined || payload_doc.fields[i].field_name == "" || payload_doc.fields[i].field_name == null) {
                    responce_data.errors.push(`Item ${i} in fields doesn't have 'field_name'`)

                //check that field_name is a string
                } else if (typeof payload_doc.fields[i].field_name != "string"){
                    responce_data.errors.push(`field_name of item ${i} in fields is not a string`)
                }

                // check that object has field_type
                if (payload_doc.fields[i].field_type == undefined || payload_doc.fields[i].field_type == "" || payload_doc.fields[i].field_type == null) {
                    responce_data.errors.push(`Item ${i} in fields doesn't have 'field_type'`)

                // check that field_type is a string
                } else if (typeof payload_doc.fields[i].field_type != "string"){
                    responce_data.errors.push(`field_type of item ${i} in fields is not a string`)
                
                // check that field_type is one of the allowed values
                } else if (allowed_field_types.includes(payload_doc.fields[i].field_type) == false){
                    responce_data.errors.push(`field_type of item ${i} in fields is not one of the allowed values`)
                }

                // check that chart_data is boolean
                if (typeof payload_doc.fields[i].chart_data != "boolean"){
                    responce_data.errors.push(`chart_data of item ${i} in fields is not a boolean or undefined`)
                }

                // check that object has field_order
                if (payload_doc.fields[i].field_order == undefined || payload_doc.fields[i].field_order == null) {
                    responce_data.errors.push(`Item ${i} in fields doesn't have 'field_order'`)
                    console.log(payload_doc.fields[i].field_order)

                // check that field_order is an integer
                } else if (typeof payload_doc.fields[i].field_order != "number"){
                    responce_data.errors.push(`field_order of item ${i} in fields is not an integer`)
                
                //add field_order to list of field orders and check that its unique
                } else {
                    if (field_orders.includes(payload_doc.fields[i].field_order)){
                        responce_data.errors.push(`field_order of item ${i} in fields is not unique`)
                    }
                    
                    field_orders.push(payload_doc.fields[i].field_order)

                }


            }

        }

    }
    return responce_data

}