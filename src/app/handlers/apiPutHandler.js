var PROJECT_DIR = process.env.PROJECT_DIR  
var database_util = require(PROJECT_DIR + '/src/app/lib/sql_functions.js')
var secrets = require(PROJECT_DIR + '/src/app/config/secrets')

module.exports.telem_reciever = async function(req, res){
    try{
        //create a new connection to the database
        var conn = await database_util.connectdb(secrets.DB_HOST, secrets.DB_USER, secrets.DB_PASSWORD, secrets.DB_NAME)
        var telem = req.body.telem
        
        var telem_data = telem.replace("$$", "")
        var flight_name = telem_data.split(",")[0]

        await database_util.write_raw_telem(conn, flight_name, telem)


        res.status(200)
        res.send(telem)
        

    } catch(e){
        console.log(e)
        res.send(500)
        
    } finally{
        conn.awaitEnd()
    }

}