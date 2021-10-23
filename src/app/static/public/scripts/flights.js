function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 51.5868, lng: -1.8904 },
      zoom: 8,
    });

    flightPath = new google.maps.Polyline({
        strokeColor: "#000000",
        strokeOpacity: 1.0,
        strokeWeight: 3,
      });
      flightPath.setMap(map);
    
  }

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

function gen_map_data(data, flight_info){
    var coords = []

    var lat_fn = flight_info["lat_field_name"]
    var lon_fn = flight_info["lon_field_name"]

    for (d in data){
        var latlng = new google.maps.LatLng(parseFloat(data[d][lat_fn]), parseFloat(data[d][lon_fn]))
        coords.push(latlng)
    }
    return coords

}

function get_last_coords(data, flight_info){
    var lat_fn = flight_info["lat_field_name"]
    var lon_fn = flight_info["lon_field_name"]

    var latitude = parseFloat(data[0][lat_fn])
    var longitude = parseFloat(data[0][lon_fn])

    return {"lat":latitude, "lon":longitude}

}

function recenter_map(lat, lon){
    let lat_lon = new google.maps.LatLng(lat, lon)
    map.setCenter(lat_lon)
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


        /// UPDATING ///

        //update telem table
        var telem_table_html = gen_telem_table(parsed_data[0], flight_info["fields"])
        document.getElementById("telem_table").innerHTML = telem_table_html

        //update flight path
        var new_coords = gen_map_data(parsed_data, flight_info)

        const path = flightPath.getPath();
        path.clear()

        for (i in new_coords){
            path.push(new_coords[i])
        }




        
        // flightPath = new google.maps.Polyline({
        //     path: new_coords,
        //     geodesic: true,
        //     strokeColor: "#FF0000",
        //     strokeOpacity: 1.0,
        //     strokeWeight: 2,
        //   });
        
        // flightPath.setMap(map)

        console.log("updated")
    } catch(e){
        console.error(e)
    }
     
}

// global map objects
var map;
var flightPath;

initMap()
update_data()
setInterval(update_data, 10000);





