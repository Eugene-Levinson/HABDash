function logout(){
    try{
        var alert_box = document.getElementById('alerts')

        //use ajax to send a post request to register the data
        $.ajax({
        type: "POST",
        url: "/logout",
        data: {},
        dataType: "json",
        success: function(result){

            if (result.logged_out){
                window.location.href = '/login';

            } else {
                alert_box.innerHTML += 
                `<div class="alert alert-danger" role="alert" id="alert">
                Something went wrong while trying to logout. Please try again or contact support
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                </div>`;

            }   
            

        } 

        });

    } catch(e){
        console.log(e)
        alert_box.innerHTML += 
        `<div class="alert alert-danger" role="alert" id="alert">
        Something went wrong while trying to logout. Please try again or contact support
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
        </div>`;
    }
}

function get_alert_html(msg, type){
    let html_code = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${msg}
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>`;

    return html_code;
}