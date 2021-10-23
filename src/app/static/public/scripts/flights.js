function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 51.5868, lng: -1.8904 },
      zoom: 6,
    });

    let marker_icon = get_marker_icon()
    let flight_colour = "#000000"

    flightPath = new google.maps.Polyline({
        strokeColor: flight_colour,
        strokeOpacity: 1.0,
        strokeWeight: 3,
      });
      flightPath.setMap(map);

       payload_marker =  new google.maps.Marker({
        map,
        title: "Hello World!",
        icon: marker_icon
      });
    
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

function get_marker_icon(){
    let size = new google.maps.Size(96, 96)

    let icon ={
        url: "https://www.habdash.org/assets/map_marker_hover_100.png",
        scaledSize: size
    }

    return icon
}

async function fetch_data(){
    try{
        //set api endpoints
        let current_url = window.location.href
        const flight_name = current_url.substring(current_url.lastIndexOf('/') + 1)
        const parsed_data_api = `/api/get-parsed-data/${flight_name}`
        const flight_info_api = `/api/get-flight/${flight_name}`


        /// FETCH DATA ///

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

        return {"flight_info" : flight_info, "parsed_data": parsed_data}

    } catch (e){
        console.error(e)
    }

}

async function update_data(){
    try{
        /// GET DATA ///
        var all_data = await fetch_data()
        var parsed_data = all_data["parsed_data"]
        var flight_info = all_data["flight_info"]

        /// UPDATING ///

        //update telem table
        var telem_table_html = gen_telem_table(parsed_data[0], flight_info["fields"])
        document.getElementById("telem_table").innerHTML = telem_table_html

        //thatsnform new data into LatLng objects
        var new_coords = gen_map_data(parsed_data, flight_info)
        var latest_coords = new_coords[0]

        //clear old path
        const path = flightPath.getPath();
        path.clear()

        //push mewly fetch coords
        for (i in new_coords){
            path.push(new_coords[i])
        }

        //recenter on first fetch
        if (!initial_recenter){
            map.setCenter(latest_coords)
            initial_recenter = true
        }

        //update payload marker position
        payload_marker.setPosition(latest_coords)

        //update the last fetch date
        last_fetch_date = new Date()

        console.log("updated")
    } catch(e){
        console.error(e)
    }
     
}

function update_last_fetched(){
     //update the "last updated" html
     var now = new Date()

     if (last_fetch_date != null){
         var time_diff = (now.getTime() - last_fetch_date.getTime())
         var date_updated = Math.ceil((time_diff/1000))
 
 
         document.getElementById("last_update_value").innerHTML = `${date_updated}s ago`
     } else {
         document.getElementById("last_update_value").innerHTML = ""
     }
}
async function every_second(){

    //update "last fetched"
    update_last_fetched()
}





// global objects
var map;
var flightPath;
var payload_marker;
var last_fetch_date = null;
var initial_recenter = false;

//function calls
initMap()
update_data()
every_second()
setInterval(update_data, 10000);
setInterval(every_second, 1000);





