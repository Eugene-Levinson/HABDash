var express = require("express");
var router = express.Router();

const asyncHandler = require('express-async-handler')

//load project dir path
var PROJECT_DIR = process.env.PROJECT_DIR;  

//api get handlers
var api_handler_get = require(PROJECT_DIR + "/src/app/handlers/apiGetHandler.js");
var api_handler_put = require(PROJECT_DIR + "/src/app/handlers/apiPutHandler.js");


//// GET ROUTES ////

//get data about a flight
router.get("/api/get-flight/:flightname", asyncHandler(api_handler_get.get_flight_data));

router.get("/api/get-raw-data/:flightname", asyncHandler(api_handler_get.get_raw_flight_data));

router.get("/api/get-parsed-data/:flightname", asyncHandler(api_handler_get.get_parsed_flight_data));

router.get("/api/my-flights", asyncHandler(api_handler_get.get_user_flights));

//// PUT ROUTES ////
router.put("/api/submit-telem", asyncHandler(api_handler_put.telem_reciever));



module.exports = router;