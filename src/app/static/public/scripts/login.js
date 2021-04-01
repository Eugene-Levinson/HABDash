function verify_input(){
    //Get all of the input fields
    var email_field = document.getElementById('emailInput')
    var password_field = document.getElementById('passwordInput')
    
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

    if (inputs_are_valid){
        document.getElementById("login_form").submit(); 
    }
    

    

}