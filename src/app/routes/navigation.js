var express = require("express");
var router = express.Router();

const asyncHandler = require('express-async-handler')

//load project dir path
var PROJECT_DIR = process.env.PROJECT_DIR;  

// Require controller modules.
var navigation_handler = require(PROJECT_DIR + "/src/app/handlers/navigationHandler.js");


//root route
router.get("/", navigation_handler.homePage);
//home route
router.get("/home", navigation_handler.homePage);
//register route
router.get("/register", navigation_handler.registerPage);
//login route
router.get("/login", asyncHandler(navigation_handler.loginPage));

//export everything out
module.exports = router;