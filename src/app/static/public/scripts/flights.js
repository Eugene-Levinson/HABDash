class NiteOverlayControl{
    constructor(niteControlDiv, map_, overlay_is_on){
        this.map_ = map_;
        this.overlay_is_on = overlay_is_on

        niteControlDiv.style.clear = "both";

        // Set CSS for the control border
        this.switch_nite = document.createElement("div");

        this.switch_nite.id = "switch_nite_control";
        this.switch_nite.className = "nite-icon"
        
        var button_hover_msg  = "Toggle day/night overlay"

        this.switch_nite.title = button_hover_msg

        niteControlDiv.appendChild(this.switch_nite);

        // Set CSS for the control interior
        this.switch_nite_text = document.createElement("div");

        var btn_msg  = "Night Overlay On"
        if (this.overlay_is_on){
            btn_msg  = "Night Overlay OFF"
        }

        this.switch_nite_text.id = "switch_nite_text";
        //this.switch_nite_text.innerHTML = btn_msg;
        this.switch_nite.appendChild(this.switch_nite_text);

        this.switch_nite.addEventListener("click", () => {
            if (this.overlay_is_on){
                nite.hide()
                this.overlay_is_on = false
            
            }  else {
                nite.show()
                nite.refresh()
                this.overlay_is_on = true
            }

          });

    }
}

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
    icon: marker_icon
    });

    // Create the DIV to hold the control and call the CenterControl()
    // constructor passing in this DIV.
    const niteControlDiv = document.createElement("nite-div");
    niteControlDiv.index = 1;
    niteControlDiv.style.paddingTop = "10px";

    const control = new NiteOverlayControl(niteControlDiv, map, false);
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(niteControlDiv);

    console.log("Maps loaded")
  }


function initNiteOverlay(google_map){
    //nite overlay - make sure its imported
    nite.init(google_map);

    //hide its by default
    nite.hide()
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
    //let size = new google.maps.Size(96, 120)
    let size = new google.maps.Size(76.8,96)
    let icon ={
        url: "https://www.habdash.org/assets/map_marker_hover_4-5.png",
        scaledSize: size
    }

    return icon
}

function addDataToChart(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
}

function removeDataFromChart(chart) {
    chart.data.labels = []
    chart.data.datasets.forEach((dataset) => {
        dataset.data = [];
    });
}


async function createOrUpdateGraphs(data, flight_info){
    return new Promise(resolve => {
        let data_fields = flight_info["fields"]

        // if no graphs on the page then make some
        if (!graphs_created){
            graphs = {}
            var graphs_html = []
            var data_fields_to_chart = []

            //generated html divs for all required graphs
            for (i in data_fields){
                var data_field = data_fields[i]

                if (data_field["chart_data"] == 1){
                    let graph_id = get_graph_id(data_field["field_name_sc"])
                    
                    let graph_div = `                        
                    <div class="d-flex justify-content-center">
                        <canvas id="${graph_id}" class=""></canvas>
                    </div>
                    `
                    graphs_html.push(graph_div)

                    //record fields that need to be graphed
                    data_fields_to_chart.push({
                        id: graph_id,
                        field_name_sc: data_field["field_name_sc"],
                        field_name: data_field["field_name"]
                    })  
                }
            }

            //add the divs to the page - graphs will go in them
            var graphs_div_element = document.getElementById(graphs_div_id)
            var count = 0

            graphs_div_element.innerHTML = ""
            for (i in graphs_html){
                graphs_div_element.innerHTML += `\n${graphs_html[i]}`
                count += 1

                if (count % 1 == 0){
                    graphs_div_element.innerHTML += '\n<div class="w-100"></div>'
                }
            }

            //generate graph objects
            for (g in data_fields_to_chart){
                var field = data_fields_to_chart[g]
                var ctx = document.getElementById(field.id)

                //data and labels
                const labels = [];
                const data = {
                    labels: labels,
                    datasets: [{
                    label: `${field["field_name"]}`,
                    backgroundColor: 'rgb(255, 99, 132)',
                    borderColor: 'rgb(255, 99, 132)',
                    borderWidth: 2,
                    data: [],
                    }]
                };
                
                 //chart config
                 const config = {
                    type: 'line',
                    data: data,
                    options: {
                        animation: false,
                        responsiveAnimationDuration: 0,
                        scales: {
                            x: {
                                ticks: {
                                    maxTicksLimit: 4
                                }
                            }
                        },

                        elements: {
                            point:{
                                radius: 0.25
                            },

                            hover: {
                                animationDuration: 0 // duration of animations when hovering an item
                            },
                            line: {
                                tension: 0 // disables bezier curves
                              }
                        }
                    }
                };

                //make a chart object and add it to the graphs dict
                const myChart = new Chart(ctx, config)

                //add generated graphs to global object
                graphs[field.id] = {
                    chart_object : myChart,
                    data_field_sc : field[["field_name_sc"]]
                }
            }

            graphs_created = true;
        }

        //fill graphs with data
        for (chart_id in graphs){
            var chart = graphs[chart_id]["chart_object"]
            var data_field = graphs[chart_id]["data_field_sc"]

            var count = 0

            //remove all data from chart
            removeDataFromChart(chart)

            //push new data to the chart
            for (i in data){
                data_point = data[i][data_field]
                addDataToChart(chart, (chart_data_limit - count), data_point)
                count += 1
            }

            //if not enough data points to rich the chart_data_limit limit
            //then we fill the rest with 0s
            while (count < chart_data_limit){
                addDataToChart(chart, (chart_data_limit - count), null)
                count += 1
            }

            //update the chart
            chart.update();
        }

        //resolve async promise
        resolve('resolved')
    });

}

function get_graph_id(f_name){
    return `${f_name}-graph`
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
        global_parsed_data = parsed_data
        global_flight_info = flight_info


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

        //update graphs
        let sliced_data = parsed_data.slice(1, chart_data_limit)
        await createOrUpdateGraphs(sliced_data, flight_info)

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
         document.getElementById("last_update_value").innerHTML = "Loading..."
     }
}

function every_second(){
    //update "last fetched"
    update_last_fetched()
}




// global objects
var map;
var flightPath;
var payload_marker;
var graphs;
var global_parsed_data;
var global_flight_info;

var last_fetch_date = null;
var initial_recenter = false;
var graphs_div_id = "graphs"
var graphs_created = false;
var chart_data_limit = 150;


//function calls
initMap()
initNiteOverlay(map)
update_data()
update_last_fetched()

setInterval(update_data, 10000);
setInterval(every_second, 1000);
setInterval(function() { nite.refresh() }, 10000);





