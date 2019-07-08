var express = require("express");
var router = express.Router({mergeParams: true});
//var Campground = require("../models/campground");
var Plan = require("../models/plan");
var Comment = require("../models/comment");
var middleware = require("../middleware/index.js");

//================================
//COMMENTS ROUTES
//comments new
router.get("/new", middleware.isLoggedIn, function(req, res){
    Plan.findById(req.params.id, function(err, plan){
        if(err){
            console.log(err);
        }
        else{
            res.render("comments/new", {plan: plan});
        }
    });
});
//comments create
router.post("/", middleware.isLoggedIn, function(req, res){
    //lookup camoground using id
    Plan.findById(req.params.id, function(err, plan){
        if(err){
            console.log(err);
        }
        else{
            //create new comment
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                }
                else{
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    //connect new comment to plan
                    plan.comments.push(comment);
                    plan.save();
                    //redirect to plan show page
                    req.flash("success", "Successfully added comment");
                    res.redirect("/plans/" + plan._id);
                }
            });    
        }
    });
});

//edit comment route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Plan.findById(req.params.id, function(err, foundPlan){
        //this guards against people manually updating the http info in the address bar to an incorrect plan
        if(err || !foundPlan){
           req.flash("error", "Cannot find plan");
           return res.redirect("back"); 
        }
        Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            res.redirect("back");
        }
        else{
            res.render("comments/edit", {planId: req.params.id, comment: foundComment}); 
        }
    });
    });
});

//update comment route
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    //req.body.comment is the body data submitted by the form in the ejs file
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        }  
        else{
            res.redirect("/plans/" + req.params.id);
        }
   }); 
});

//destroy comment route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
            console.log("delete error");
        }
        else{
            req.flash("success", "Comment deleted");
            res.redirect("/plans/" + req.params.id);
        }
    });
});

module.exports = router;