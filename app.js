//to  update: this remove old version and installs new version
//npm uninstall mongoose ; npm install --save mongoose@5.5.1
//TODO LIST:  CHECK THIS WHEN COMING BACK TO PROJECT
   //fix download links that dont have data -- to fix this, set them all into a zip file before uploading, then 
        //when downloading will always at least need to have a drawing so the entire package will always download
   //make so that can delete a say dxf file without replacing it
   //fix super long wait time when uploading g code files
   //add a upload loading bar thing so just doesnt hang there
   //add filters that interact with the search - not sure how best to do this
   //display last entered filter / search into main page so that people know what they entered (seems to be working)
   
   //this is basically just turning into instructables...
   //no it isnt, instructables you can download CNC files, and the instructions, but I have yet to find just a CAD drawing.
   //I think this needs to become more specialized in order to be worth it.
   //AutoCAD files

   //features to add:
   //featured plans page that are selected somehow.  Payment?  Or recently added
   //reply to comments
   //add a rating system
   //display user image with username number of posts and comments, average rating, can display email maybe if wants to be contacted regarding work questions etc.
   //download a zipped package with all docs, or individually?
   //change the filter to be links to each section
      //then can filter to other sections like matt mentions in his notes

   

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

//RUN WITH --inspect to run debugger in chrome dev tools
//THEN go to the page, click on the link and make sure it says debugger attached in the console

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

