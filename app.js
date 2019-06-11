//to  update: this remove old version and installs new version
//npm uninstall mongoose ; npm install --save mongoose@5.5.1

var express = require("express");
var app = express();  //to use express
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var methodOverride = require("method-override");
var Campground = require("./models/campground");
var Comment = require("./models/comment");
var User = require("./models/user");
var seedDB = require("./seeds");
var passport = require("passport");
var LocalStrategy = require("passport-local");

var commentRoutes = require("./routes/comments");
var campgroundRoutes = require("./routes/campgrounds");
var indexRoutes = require("./routes/index");  //auth routes
//seedDB();  //seed the database

mongoose.connect("mongodb://localhost:27017/yelp_camp", { useNewUrlParser: true });

//authentication - checks if someone is who they say they are
//authorization - once we know who they are, what permissions do they have

//express package assignments?  Something like that
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");  //to use ejs 
//__dirname passes the full directory path that this script was ran in
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));   //this is that wierd method override that is required because of wierd routing
app.use(flash());


//PASSPORT CONFIG
app.use(require("express-session")({
    secret: "Rusty is a dank dog",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//res.locals is what is available in each ejs template
//without next everything will halt.  it tells it to move on from the middleware.
app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

app.get("/", function(req, res){
    res.render("landing");
});


//tells app to use these
app.use(indexRoutes);
app.use("/campgrounds",campgroundRoutes);  //all routes start with /campgrounds
app.use("/campgrounds/:id/comments",commentRoutes);






app.listen(process.env.PORT, process.env.IP, function(){
    console.log("server started");
});

//RESTFUL ROUTES
//name (route)     url                 verb        descr.
//===============================================================
//INDEX           /campgrounds          GET       Display a list of all dogs
//NEW             /campgrounds/new      GET       Displays a form to make a new dog
//CREATE          /campgrounds          POST      Add a new dog to DB
//SHOW            /campgrounds/:id      GET       Shows info about one dog

//nested routes for comments
//NEW             /campgrounds/:id/comments/new
//CREATE          /campgrounds/:id/comments

//db.collection.drop() -- deletes all items in database

/*IMPROVEMENT VIDEOS ADDED AFTER -- UTILIZE THESE

Hi Everyone!
I've been working on some additional features for the YelpCamp project. You can view the source code here. So far I've included the following features: 

CSS3 background animation on landing page 

Fuzzy Search 

Campground location with Google Maps

Campground cost 

Footer 

Home link in navigation 

Authentication flash messages 

Display time since post was created with Moment JS 

User profile 

Password reset 

Image upload with multer and cloudinary 

Migration/upgrade instructions for Bootstrap 4

Refactor callbacks with Async/Await

In-app notifications

*See below for all tutorial links as well as additional tutorials provided by Zarko

Ratings and reviews

Comments on the campground show page

Pagination in campgrounds index

- UI Improvements (login and signup, nav-bar, registration flash message) - http://slides.com/nax3t/yelpcamp-refactor-ui (currently unavailable, working to get account back online right now! sorry for the inconvenience)

- Pricing feature - http://slides.com/nax3t/yelpcamp-refactor-pricing (currently unavailable, working to get account back online right now! sorry for the inconvenience)

UPDATED!!! - Google Maps location - https://www.youtube.com/watch?v=B4OuCjQLJ9k

- Time since created w/ Moment JS - http://slides.com/nax3t/yelpcamp-refactor-moment (currently unavailable, working to get account back online right now! sorry for the inconvenience)

- Admin role (user roles) - https://www.youtube.com/watch?v=somc45pnM2k

- User profile - https://youtu.be/6ar77jZ_ajc

- Password reset - https://youtu.be/UV9FvlTySGg

- Fuzzy Search - https://youtu.be/9_lKMTXVk64

- Image upload - https://youtu.be/RHd4rP9U9SA

- Migrating to Bootstrap 4 - https://www.youtube.com/watch?v=NHHh0sj1uKY

- Refactor callbacks in seeds.js to use Async/Await - https://youtu.be/D_q-sQCdZXw

NEW!!! - In-app Notifications - https://www.youtube.com/watch?v=Tt9orKnUiEU



Tutorials by Zarko:

--------------------------

NEW!!! - Ratings and Reviews - https://github.com/zarkomaslaric/yelpcamp-review-system/blob/master/readme.md

- Comments on the show page - https://www.udemy.com/the-web-developer-bootcamp/learn/v4/questions/3190558

- Pagination on campgrounds index - https://www.udemy.com/the-web-developer-bootcamp/learn/v4/questions/3190496

Additional Student Resources: 
-------------------------------------------

- Useful links from the course - https://www.udemy.com/the-web-developer-bootcamp/learn/v4/questions/3839394

- More useful links - https://docs.google.com/spreadsheets/d/1UHbhgZrpY7UwPbJqMlQjCLrxmReLhWH_bZeQIosYa4w/edit#gid=0

- Complete course notes - https://drive.google.com/drive/folders/12jCkOQCAtXoxxpwfevuWDlYgWj6ryh3N

Have a YelpCamp tutorial that you'd like featured? Please contact me in a direct message with a link to the tutorial.

-------
Thanks,
Ian*/

/*git -- init creates the repo, starting at the folder you are in*/