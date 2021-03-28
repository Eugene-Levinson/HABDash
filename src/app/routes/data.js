var express = require("express");
var router = express.Router();

//load project dir path
var PROJECT_DIR = process.env.PROJECT_DIR  

var data_handler = require(PROJECT_DIR + "/src/app/handlers/dataHandler.js");

//register route
router.post("/register", data_handler.registerNewUser);

module.exports = router;