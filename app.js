//to  update: this remove old version and installs new version
//npm uninstall mongoose ; npm install --save mongoose@5.5.1

var express = require("express");
var app = express();  //to use express

var dotEnv = require('dotenv').config();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var methodOverride = require("method-override");
//var Campground = require("./models/campground");
var Plan = require("./models/plan");
var Comment = require("./models/comment");
var User = require("./models/user");
var seedDB = require("./seeds");
var moment = require('moment');
var passport = require("passport");
var LocalStrategy = require("passport-local");

var commentRoutes = require("./routes/comments");
//var campgroundRoutes = require("./routes/campgrounds");
var planRoutes = require("./routes/plans")
var indexRoutes = require("./routes/index");  //auth routes
//seedDB();  //seed the database


const host_ip = '127.0.0.1';
const port = 3000;


//var url = process.env.databaseURL || //use this environment variable to connect to different databases  NOT USED RIGHT NOW SET UP AFTER MOVING OVER

mongoose.connect("mongodb+srv://ryan:dyck@cluster0-yozy2.mongodb.net/test?retryWrites=true&w=majority", { 
    useNewUrlParser: true, userCreateIndex: true 
}).then(() =>{
    console.log("Connected to DB!");
}).catch(err => {
    console.log("Error:", err.message);
});



//authentication - checks if someone is who they say they are
//authorization - once we know who they are, what permissions do they have

//express package assignments?  Something like that
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");  //to use ejs 
//__dirname passes the full directory path that this script was ran in
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));   //this is that wierd method override that is required because of wierd routing
app.use(flash());

app.locals.moment = require("moment");
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
    //res.render("landing");
        //eval(require('locus'));
        //otherwise get all plans and display
        //get all plans from db
        Plan.find({}, function(err, allPlans){
            if(err){
                console.log(err);
                //TODO add error page? -- like the nice google dinosaur one or something
            }
            else{
                res.render("plans/index", {plans: allPlans, noMatch: undefined});
            }
        });
});


//tells app to use these
app.use(indexRoutes);
app.use("/plans", planRoutes);  //all routes start with /plans
app.use("/plans/:id/comments",commentRoutes);





//old cloud9 port and host
/*app.listen(process.env.PORT, process.env.IP, function(){
    console.log("server started");
});*/
app.listen(port, host_ip, () => {
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

Fuzzy Search (DONE)

Campground location with Google Maps (DONT NEED)

Campground cost  (DONT NEED) 

Footer (MAYBE DO THIS)

Home link in navigation (DONT WANT)

Authentication flash messages (MAYBE DO THIS)

Display time since post was created with Moment JS (DO THIS)

User profile (DONE)

Password reset (DONE)

Image upload with multer and cloudinary (DONE)

Migration/upgrade instructions for Bootstrap 4 (DONE)

Refactor callbacks with Async/Await (DO THIS)

In-app notifications (WHAT IS THIS)

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



//DOCUMENTATION

//MEN stack - Mongo, express, node (uses ejs so not a mean or mern stack)
  

//MongoDB Atlas is hosting the database

//mongoose for mongodb interfacing

//multer and cloudinary for image upload
//NOTE: Cloudinary has services for image filtering to remove nsfw images etc. USE THIS

//passport and passport-local for user authentication




//more of the details:

//body-parser for http req parsing
//flash for pop up notifcations ie: username already exists etc.
//dotenv for environment variables - useful for hiding information

