var Campground = require("../models/campground");
var Comment = require("../models/comment");

//all the middleware goes here
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next){
    //is user logged in
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", "Campground not found");
            res.redirect("back");
        }
        else{
            //does user own the campground?
            //author.id is a mongoose obj, ._id is a string so need to use a special mongoose method
            if(foundCampground.author.id.equals(req.user._id)){
                next(); //move on to the next code in the callback
            }
            else{
                //otherwise, redirect
                req.flash("error", "You don't have permission to do that");
                res.redirect("back");
            }
        }
    }); 
    }
    //if not, redirect
    else{
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back"); //sends to previous page
    }
}

middlewareObj.checkCommentOwnership = function (req, res, next){
    //is user logged in
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err || !foundComment){
            req.flash("error", "Comment not found");
            res.redirect("back");
        }
        else{
            //does user own the comment?
            //author.id is a mongoose obj, ._id is a string so need to use a special mongoose method
            if(foundComment.author.id.equals(req.user._id)){
                next(); //move on to the next code in the callback
            }
            else{
                //otherwise, redirect
                req.flash("error", "You don't have permission to do that");
                res.redirect("back");
            }
        }
    }); 
    }
    //if not, redirect
    else{
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back"); //sends to previous page
    }
}

//middleware to check if user is logged in //needs to use next
middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that");  //in the flash, add the message to the next http request
    res.redirect("/login");
}

module.exports = middlewareObj