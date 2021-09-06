var express = require("express");
var router = express.Router();

const asyncHandler = require('express-async-handler')

//load project dir path
var PROJECT_DIR = process.env.PROJECT_DIR;  

//api get handlers
var api_handler_get = require(PROJECT_DIR + "/src/app/handlers/apiGetHandler.js");


//// GET ROUTES ////

//get data about a flight
router.get("/api/get-flight/:flightname", asyncHandler(api_handler_get.get_flight_data));



module.exports = router;