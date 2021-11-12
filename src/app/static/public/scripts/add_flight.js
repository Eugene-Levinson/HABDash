function get_alert_html(msg, type){
    let html_code = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${msg}
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>`;

    return html_code;
}

async function add_new_flight(){
    try {
        var alert_box = document.getElementById("alerts");
        var payload_doc = document.getElementById("payload-doc");

        // check that there is a file attached
        if (payload_doc.files.length == 0){
            alert_box.innerHTML = get_alert_html("No file has been selected. Please upload a payload doc before submitting", "warning");
            return

        }  else {
            console.log("File selected");
        }

        // check that the file is a json file   
        if (payload_doc.files[0].name.split(".")[1] != "json"){
            alert_box.innerHTML = get_alert_html("Payload doc has to be a json", "warning");
            return
        }

        // check that the file is not too big
        if (payload_doc.files[0].size > 1000000){
            alert_box.innerHTML = get_alert_html("Payload doc is too big", "warning");
            return
        }

        // send the data
        var response = await fetch("/api/add-flight", {
            method: "POST",
            body:  payload_doc.files[0]
        });

    
        //parsed response
        var parsed_responce = await response.json()
        
        // check that the response is ok
        if (response.ok){
            console.log("File uploaded");

            alert_box.innerHTML = get_alert_html("Payload doc has been successfully submitted", "success");

        } else if (response.status == 406){
            console.warn(parsed_responce)

            alert_box.innerHTML = ""

            for (error in parsed_responce.errors){
                alert_box.innerHTML += get_alert_html(`Payload doc is not valid: ${parsed_responce.errors[error]}`, "warning");
            }

        } else if (response.status == 400) {
            alert_box.innerHTML = get_alert_html("Error occured when processing your doc. Make sure your JSON syntax is correct", "warning");
        
        } else if (response.status == 401){
            alert_box.innerHTML = get_alert_html("You have to be logged in to add a flight", "danger");
        
        } else {
            console.error("File upload failed");
            console.error(response);

            alert_box.innerHTML = get_alert_html("Failed to submit payload doc", "danger")
        }



    } catch (err){
        console.log(err);

        alert_box.innerHTML = get_alert_html(`An unexpected error occured ${err}`, "danger")
    }

}