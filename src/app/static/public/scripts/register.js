function verify_input(){
    //Get all of the input fields
    var name_field = document.getElementById('nameInput')
    var surname_field = document.getElementById('surnameInput')
    var email_field = document.getElementById('emailInput')
    var password_field = document.getElementById('passwordInput')
    var password2_field = document.getElementById('password2Input')
    var rem_me_field = document.getElementById('rem_me')

    var inputs_are_valid = true

    //check if first name is empty
    if (name_field.value == ""){
        name_field.style.borderColor = "red"
        inputs_are_valid = false
        
    } else {
        name_field.style.borderColor = "grey"
    }
    

    //check if last name is empty
    if (surname_field.value == ""){
        surname_field.style.borderColor = "red"
        inputs_are_valid = false
        
    } else {
        surname_field.style.borderColor = "grey"
    }
    
    
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
    

    //check if the second password field is empty
    if (password2_field.value == "") {
        password2_field.style.borderColor = "red"
        inputs_are_valid = false

    } else {
        password2_field.style.borderColor = "grey"
    }
    

    //check if the password fields don't match
    if (password_field.value != password2_field.value){
        inputs_are_valid = false
       
    }
    

    if (inputs_are_valid){
        //document.getElementById("register_form").submit();
        var data = {}
        
        data.name = name_field.value
        data.surname = surname_field.value
        data.email = email_field.value
        data.password = password_field.value
        data.password2 = password2_field.value

        ajaxPost(data)
    }
}


function check_if_passwords_match(){
    var password_field = document.getElementById('passwordInput')
    var password2_field = document.getElementById('password2Input')
    var password_label = document.getElementById('pwd-match-text')


    //display the password label only if both fields have something in them
    if (password_field.value != "" && password2_field.value != ""){
        password_label.style.visibility = "visible"

    } else {
        password_label.style.visibility = "hidden"
    }


    //change the label depending if the passwords match or not
    if (password_field.value == password2_field.value){
        password_label.style.color = "green"
        password_label.innerHTML = "Passwords match!"
    
    } else {
        password_label.style.color = "red"
        password_label.innerHTML = "Passwords don't match!"
    }
}


function ajaxPost(data){
    try{

        //use ajax to send a post request to register the data
        $.ajax({
        type: "POST",
        url: "/register",
        data: data,
        dataType: "json",
        success: function(result){
            var alert_box = document.getElementById('alerts')

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
        console.log(e)
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


