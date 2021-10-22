
function gen_telem_table(data, fields){
    var col_names_list = []
    var col_names_list_snake = []

    var data_points_list = []

    //names for the table header
    for(f in fields){
        var name = fields[f]["field_name"]
        var name_sc = fields[f]["field_name_sc"]

        col_names_list.push(`\n  <th scope="col">${name}</th>`)
        col_names_list_snake.push(name_sc)
    }

    //data points for the table
    for(col in col_names_list_snake){
        var data_point = data[col_names_list_snake[col]]
        data_points_list.push(`\n  <td>${data_point}</td>`) 
    }

    //combine lables and data points
    var rows_html = ""
    for (n in col_names_list){
        var name = col_names_list[n]
        var data_point = data_points_list[n]

        var row = `
        <tr> 
            ${name}
            ${data_point}
        </tr>
        `
        rows_html += row
    }

    table_html = `
    <table class="table">
        <tbody>
            ${rows_html}
        </tbody>
    </table>
    `

   return table_html

}

async function update_data(){
    try{
        //set api endpoints
        let current_url = window.location.href
        const flight_name = current_url.substring(current_url.lastIndexOf('/') + 1)
        const parsed_data_api = `/api/get-parsed-data/${flight_name}`
        const flight_info_api = `/api/get-flight/${flight_name}`

        //fetch parsed data
        var parsed_data_responce = await fetch(parsed_data_api)

        //check that we got the data and conver it to json
        if (parsed_data_responce.status != 200){
            console.error(`Couldn't fetch parsed data.\nRequested ${parsed_data_responce.url}\nGot status ${parsed_data_responce.status}`)
            var parsed_data = null

        } else {
            var parsed_data = await parsed_data_responce.json()
        }

        //fetch flight config
        var flight_info_responce = await fetch(flight_info_api)

        //check that we got the data and conver it to json
        if (flight_info_responce.status != 200){
            console.error(`Couldn't fetch flight info.\nRequested ${flight_info_responce.url}\nGot status ${flight_info_responce.status}`)
            var flight_info = null

        } else {
            var flight_info = await flight_info_responce.json()
        }


        //console.log(flight_info)
        //console.log(parsed_data)
        var telem_table_html = gen_telem_table(parsed_data[0], flight_info["fields"])
        
        document.getElementById("telem_table").innerHTML = telem_table_html

        console.log("updated")
    } catch(e){
        console.error(e)
    }
     
}
update_data()
setInterval(update_data, 10000);
//update_data()