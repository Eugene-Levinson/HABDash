var express = require("express");
var router = express.Router();

const asyncHandler = require('express-async-handler')

//load project dir path
var PROJECT_DIR = process.env.PROJECT_DIR  

var data_handler = require(PROJECT_DIR + "/src/app/handlers/dataHandler.js");

//register data route
router.post("/register", asyncHandler(data_handler.registerNewUser));

//login data route
router.post("/login", asyncHandler(data_handler.loginUser));

module.exports = router;