var url = require("url"),
	querystring = require("querystring");
	var MS = require("mongoskin");

	var Client = require('node-rest-client').Client;
	var client = new Client();

	var db = MS.db("mongodb://127.0.0.1:27017/rssApp");


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
app.use(require("cookie-parser")(secret));
var MongoStore = require('connect-mongo')(session);
app.use(session( {store: new MongoStore({
   url: 'mongodb://127.0.0.1:27017/test',
   secret: secret
})}));
app.use(passport.initialize());
app.use(passport.session());
var flash = require('express-flash');
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


app.get("/", function (req, res) {
      res.redirect("/index.html");
});



app.get("/getAllFeeds", isLoggedIn, function (req, res) {
	var userID = req.user.local.email;
  db.collection('data').find({userID:userID}).toArray(function(err, items) {
    res.send(JSON.stringify(items));
  });
});



app.get("/getFeedData", function (req, res) {
  var url = req.query.url;

  client.get(url, function (data, response) {
      // parsed response body as js object
      res.send(data);
  });
});


app.get("/editFeed", isLoggedIn, function (req, res) {
  var id = req.query.id;
  var newText = req.query.newText;
  db.collection("data").findOne({id: id}, function(err, result){
    result.title = newText;
    db.collection("data").save(result, function(e1,r1){
      db.collection('data').find({}).toArray(function(e2, items) {
        res.send(JSON.stringify(items));
      });
    });
  });
});



app.get("/deleteFeed", isLoggedIn, function (req, res) {
  var id = req.query.id;
  db.collection("data").remove({id: id}, function(err0, result0){
      db.collection('data').find({}).toArray(function(e2, items) {
        res.send(JSON.stringify(items));
      });
  });
});

app.get("/addFeed", isLoggedIn, function (req, res) {
    var text = req.query.text;
    var newFeed = {
      title: "Untitled",
      id: "id" + new Date().getTime(),
      text: text,
      ts:  new Date().getTime(),
      done: false,
			userID: req.user.local.email
    };
    var cb = function(err0, result){
      var cb1 = function(err, items) {
        res.send(JSON.stringify(items));
      }
      db.collection('data').find({}).toArray(cb1);
    }
    db.collection("data").insert(newFeed, cb);
});





// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.send('noauth');
}
