require("express-async-errors");
const express = require("express");
const app = express();
const error = require("./middlewares/error");
//! This is for testing. 
//! ---- Middlewares -----
//* we don't have to write middlewares/index. Because by default it will call the index.js file.
require("./middlewares")(app);
//! ----- Routers -----
require("./middlewares/routes")(app);
//! This function is for handling async await error.
app.use(error);

module.exports = app;
