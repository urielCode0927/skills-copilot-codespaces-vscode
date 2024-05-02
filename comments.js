// Create web server
// npm install express
// npm install body-parser
// npm install ejs
// npm install express-sanitizer
// npm install method-override
// npm install mongoose
// npm install passport
// npm install passport-local
// npm install passport-local-mongoose
// npm install express-session
// npm install connect-flash

var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Comment = require("./models/comment");
var Campground = require("./models/campground");
var seedDB = require("./seeds");
var methodOverride = require("method-override");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var User = require("./models/user");
var flash = require("connect-flash");
var session = require("express-session");

// Seed the database
seedDB();

// Connect to the database
mongoose.connect("mongodb://localhost/yelp_camp_v9");

// Use body-parser
app.use(bodyParser.urlencoded({extended: true}));

// Use ejs
app.set("view engine", "ejs");

// Use custom stylesheet
app.use(express.static(__dirname + "/public"));

// Use method-override
app.use(methodOverride("_method"));

// Use express-session
app.use(session({
    secret: "This is a secret",
    resave: false,
    saveUninitialized: false
}));

// Use flash
app.use(flash());

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Custom middleware
app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

// Landing page
app.get("/", function(req, res) {
    res.render("landing");
});

// INDEX - Display a list of all campgrounds
app.get("/campgrounds", function(req, res) {
    // Get all campgrounds from the database
    Campground.find({}, function(err, campgrounds) {
        if (err) {
            console.log(err);
        } else {
            // Render the campgrounds page with the campgrounds data
            res.render("campgrounds/index", {campgrounds: campgrounds});
        }
    });
});

// NEW - Display a form to make