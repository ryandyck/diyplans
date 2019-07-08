var express = require("express");
var router = express.Router();
var Plan = require("../models/plan");
//if you just require a folder, it will require the file named index, so index.js in this is optional
var middleware = require("../middleware/index.js");

//INDEX ROUTE
//REST convention - this is where the data is displayed
router.get("/", function(req, res){

    
    //get all plans from db
    Plan.find({}, function(err, allPlans){
        if(err){
            console.log(err);
        }
        else{
            res.render("plans/index", {plans: allPlans});
        }
    });
    
});

//CREATE ROUTE
//for REST convention, this should match the get of where the forms post data is displayed
router.post("/", middleware.isLoggedIn, function(req, res){
    //get data from form and add to plans
    var name = req.body.name;
    var drawing = req.body.drawing;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newPlan = {name: name, drawing: drawing, image: image, description: desc, author: author};
    
    //Create a new plan and save to database
    Plan.create(newPlan, function(err, newlyCreatedPlan){
        if(err){
            console.log(err);
        }
        else{
            //redirect back to updated plans page
            //When redirecting, default is to redirect as a get request, so wont go to another with same name with post route
            console.log(newlyCreatedPlan);
            res.redirect("/plans");
        }
    });
    
});

//NEW ROUTE
//REST convention - this should show the form where the data is sent to the app.post route
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("plans/new");
});


//SHOW ROUTE
//shows more information about a single item
//this should be declared after /new, because the id will think new is a variable if defined before other route
router.get("/:id", function(req, res){
    //find the plan
    Plan.findById(req.params.id).populate("comments").exec(function(err, foundPlan){
       if(err || !foundPlan){
           req.flash("error", "Plan not found");
           res.redirect("back");
       }
       else{
           console.log(foundPlan);
           //render show template with that plan
           res.render("plans/show", {plan: foundPlan});
       }
    });
});

//edit plan route
router.get("/:id/edit", middleware.checkPlanOwnership, function(req, res){
    Plan.findById(req.params.id, function(err, foundPlan){
        res.render("plans/edit", {plan: foundPlan});
    });  //shouldnt be an error here because of middleware
});

//update plan route
router.put("/:id", middleware.checkPlanOwnership, function(req, res){
    //find and update the correct plan
    Plan.findByIdAndUpdate(req.params.id, req.body.plan, function(err, updatedPlan){
        if(err){
            res.redirect("/plans");
        }
        else{
            //redirect somewhere
            res.redirect("/plans/" + req.params.id);
        }
    });

});

//destroy plan route
router.delete("/:id", middleware.checkPlanOwnership, function(req, res){
    Plan.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/plans");
            console.log("delete error");
        }
        else{
            req.flash("success", "Plan deleted");
            res.redirect("/plans");
        }
    });
});

module.exports = router;