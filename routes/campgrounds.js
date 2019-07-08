/*var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
//if you just require a folder, it will require the file named index, so index.js in this is optional
var middleware = require("../middleware/index.js");

//INDEX ROUTE
//REST convention - this is where the data is displayed
router.get("/", function(req, res){

    
    //get all campgrounds from db
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        }
        else{
            res.render("campgrounds/index", {campgrounds: allCampgrounds});
        }
    });
    
});

//CREATE ROUTE
//for REST convention, this should match the get of where the forms post data is displayed
router.post("/", middleware.isLoggedIn, function(req, res){
    //get data from form and add to campgrounds
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {name: name, price: price, image: image, description: desc, author: author};
    
    //Create a new campground and save to database
    Campground.create(newCampground, function(err, newlyCreatedCampground){
        if(err){
            console.log(err);
        }
        else{
            //redirect back to updated campgrounds page
            //When redirecting, default is to redirect as a get request, so wont go to another with same name with post route
            console.log(newlyCreatedCampground);
            res.redirect("/campgrounds");
        }
    });
    
});

//NEW ROUTE
//REST convention - this should show the form where the data is sent to the app.post route
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new");
});


//SHOW ROUTE
//shows more information about a single item
//this should be declared after /new, because the id will think new is a variable if defined before other route
router.get("/:id", function(req, res){
    //find the campground
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
       if(err || !foundCampground){
           req.flash("error", "Campground not found");
           res.redirect("back");
       }
       else{
           console.log(foundCampground);
           //render show template with that campground
           res.render("campgrounds/show", {campground: foundCampground});
       }
    });
});

//edit campground route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    });  //shouldnt be an error here because of middleware
});

//update campground route
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    //find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
            res.redirect("/campgrounds");
        }
        else{
            //redirect somewhere
            res.redirect("/campgrounds/" + req.params.id);
        }
    });

});

//destroy campground route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds");
            console.log("delete error");
        }
        else{
            req.flash("success", "Campground deleted");
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router;*/