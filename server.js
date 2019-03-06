var url = require("url"),
	querystring = require("querystring");

var passport = require('passport');
var fs = require('fs');
var path = require('path'),
  express = require('express'),
  db = require('mongoskin').db('mongodb://127.0.0.1:27017/test');


var mongoose = require('mongoose');
var configDB = require('./passport/config/database.js');
mongoose.connect(configDB.url); // connect to our database

var app = express();
var secret = 'test' + new Date().getTime().toString()

var session = require('express-session');
app.use(passport.initialize());
var MongoStore = require('connect-mongo')(session);
var flash = require('express-flash');
app.use(require("cookie-parser")(secret));
app.use(session( {store: new MongoStore({
   url: 'mongodb://127.0.0.1:27017/test',
   secret: secret
})}));
app.use( flash() );      

var bodyParser = require("body-parser");
var methodOverride = require("method-override");

app.use(methodOverride());
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended:false 
}));
require('./passport/config/passport')(passport); // pass passport for configuration
require('./passport/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport


app.use(express.static(path.join(__dirname, 'public')));


app.listen(8080);




// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.send('noauth');
}

