var express = require("express");
var router = express.Router();

//load project dir path
var PROJECT_DIR = process.env.PROJECT_DIR  

//serve style and script files 
router.use(express.static(PROJECT_DIR + '/src/app/static/public'))

//export everything out
module.exports = router;