async function load_dashboard_data() {
    try{
        let url = 'https://www.habdash.org/api/my-flights';

        // Get the data from the API
        let data = await fetch(url);

        // check if responce status is 200
        if (data.status != 200) {
            console.log('Error: ' + data.status);

            let alert_box = document.getElementById('alerts');
            alert_box.innerHTML = `
            <div class="alert alert-danger" role="alert">
                Server responded with a non 200 status code.
                Make sure you are logged in. If this error
                persists, contact the server administrator.
            </div>`

            return;
        }

        //parse response to json
        let my_flights = await data.json();

        console.log(my_flights);
        
        // check if my_flights is empty
        if (my_flights.length == 0 || my_flights == null || my_flights == undefined) {
            let main_body = document.getElementById('main-body');
            main_body.innerHTML = "You don't have any flights. Create your first one"
            return

        }

        let main_body = document.getElementById('main-body');

        var flight_info;
        // for every one of my flights
        for (i in my_flights){


            // Get more info about the flight
            try {
                let url = 'https://www.habdash.org/api/get-flight/' + my_flights[i];

                var flight_info = {description: "Couldn't load"};

                let data = await fetch(url);

                // check if responce status is 200
                if (data.status == 200) {
                    flight_info = await data.json();
                    console.log(flight_info);
                }

            } catch (e){
                console.log(e)

            } finally {

                // display a card with that flight
                main_body.innerHTML += `<a href="flights/${my_flights[i]}" style="background-color:white; margin: 2px; ">
                            <article class="flight-article" style=" width: 100%; min-height: 8ch; display: flex; align-items: center; "> 
                                <div style="font-size: large; color: black; padding-left: 10px; width: 100%; word-wrap: break-word;">
                                    <div class="row">
                                        <div class="col-xl-4 mt-md-0 mt-3">
                                            ${my_flights[i]} 
                                        </div>
                                        <div class="col-xl-8 mt-md-0 mt-3 ">
                                            <small>Description: ${flight_info.description}</small>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </a>
                        <a href="/" class="btn btn-warning" role="button" style="margin-bottom: 3ch; margin-top: 1ch;" >Edit Doc</a>`
            }
            
            
        }


    // catch errors
    } catch(error) {
        console.log(error);

        let alert_box = document.getElementById('alerts');
        alert_box.innerHTML = `
        <div class="alert alert-danger" role="alert">
            An error occured while loading your flights. Please make sure you are logged in and try again.
            If this error repetes please contact support.
        </div>`
    }
}


