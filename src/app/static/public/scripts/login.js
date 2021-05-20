function verify_input(){
    //Get all of the input fields
    var email_field = document.getElementById('emailInput')
    var password_field = document.getElementById('passwordInput')
    var rem_me = document.getElementById('rem_me')
    
    var inputs_are_valid = true

    //check that the email address is structured correctly
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!re.test(String(email_field.value).toLowerCase())){
        email_field.style.borderColor = "red"
        inputs_are_valid = false

    } else {
        email_field.style.borderColor = "grey"
    }

    //check if first password field is empty
    if (password_field.value == "") {
        password_field.style.borderColor = "red"
        inputs_are_valid = false

    } else {
        password_field.style.borderColor = "grey"

    }

    //if the inputs are valid then we submitt the code to the server for authentication
    if (inputs_are_valid){
        var data = {}
        data.email = email_field.value
        data.password = password_field.value
        data.rem_me = rem_me.checked

        ajaxPost(data)

    }
}


function ajaxPost(data){
    
    try{

        //use ajax to send a post request to register the data
        $.ajax({
        type: "POST",
        url: "/login",
        data: data,
        dataType: "json",
        success: function(result){
            var alert_box = document.getElementById('alerts')
            console.log("TEST")
            
            //if there are errors output them if no errors then redirect to dashboard
            if(result.errors.length > 0){
                //reset any alerts
                alert_box.innerHTML = ""

                //create new alerts for every error
                for(var error in result.errors){
                    alert_box.innerHTML += 
                    `<div class="alert alert-danger" role="alert" id="alert">
                    ${result.errors[error]}
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    </div>`;
                }
            } else {
                window.location.href = '/dashboard';
            }
        } 

        });

    } catch(e){
        var alert_box = document.getElementById('alerts')
        var error = "Cannot submitt data to the server. Please try again later or contact support"

        //dsplay error msg
        alert_box.innerHTML = ""
        alert_box.innerHTML += 
        `<div class="alert alert-danger" role="alert" id="alert">
        ${error}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
        </div>`;
    }

}

function bind_keys(){
    $(document).keypress(function(e){
        if (e.which == 13){
            $("#submit_button").click();
        }
    });

}
