// load .env data into process.env
require('dotenv').config();

// Web server config
const PORT       = process.env.PORT || 8080;
const ENV        = process.env.ENV || "development";
const express    = require("express");
const bodyParser = require("body-parser");
const app        = express();
const morgan     = require('morgan');
const cookieSession = require("cookie-session");
const methodOverride = require("method-override");
const cors = require("cors");

// PG database client/connection setup
const { Pool } = require('pg');
const dbParams = require('./lib/db.js');
const db = new Pool(dbParams);
db.connect();

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));
app.use(cors({ credentials: true, preflightContinue: true }));
app.use(function (req, res, next) {
  res.header(
    // Allow React-app to send requests to this server
    "Access-Control-Allow-Origin",
    process.env.CLIENT || "http://localhost:3000" 
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Credentials", true);
  next();
});
app.use(bodyParser.json());
app.use(
  cookieSession({
    name: "session",
    keys: ["key1"],
  })
);
app.use(methodOverride("_method"));
app.use(express.static("public"));

// Separated routes for each resource
// Note: Feel free to replace the example routes below with your own
const rootRoutes = require("./routes/rootRoutes");
const userRoutes = require("./routes/userRoutes");

// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/api", rootRoutes(db));
app.use("/api/user", userRoutes(db));
// Note: mount other resources here, using the same pattern above

// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
