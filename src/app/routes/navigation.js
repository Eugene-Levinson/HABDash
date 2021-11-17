var express = require("express");
var router = express.Router();

const asyncHandler = require('express-async-handler')

//load project dir path
var PROJECT_DIR = process.env.PROJECT_DIR;  

// Require controller modules.
var navigation_handler = require(PROJECT_DIR + "/src/app/handlers/navigationHandler.js");


//root route
router.get("/", asyncHandler(navigation_handler.homePage));
//home route
router.get("/home", asyncHandler(navigation_handler.homePage));
//register route
router.get("/register", asyncHandler(navigation_handler.registerPage));
//login route
router.get("/login", asyncHandler(navigation_handler.loginPage));
//dashboard route
router.get("/dashboard", asyncHandler(navigation_handler.dashboard_page));
//all flight pages
router.get("/flights/:flightId", asyncHandler(navigation_handler.flight));
//add flight page
router.get("/add-flight", asyncHandler(navigation_handler.add_flight));
//page to edit a flight
router.get("/edit-flight/:flightId", asyncHandler(navigation_handler.edit_flight));

//export everything out
module.exports = router;