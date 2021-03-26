var express = require("express");
var router = express.Router();

//load project dir path
var PROJECT_DIR = process.env.PROJECT_DIR  

// Require controller modules.
var navigation_handler = require(PROJECT_DIR + "/src/app/handlers/navigationHandler.js");


//root route
router.get("/", navigation_handler.hello_world);
//home route
router.get("/home", navigation_handler.hello_world);

//export everything out
module.exports = router;