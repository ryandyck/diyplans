var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Plan = require("../models/plan");
//AUTH ROUTES

//show register form
router.get("/register", function(req, res){
    res.render("register");
});

//handle sign up logic
router.post("/register", function(req, res){
    //var newUser = new User({username: req.body.username});
    var newUser = new User({username: req.body.username,
                            firstName: req.body.firstName, 
                            lastName: req.body.lastName,
                            avatar: req.body.avatar,
                            email: req.body.email
     });
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            //req.flash("error", err.message);
            return res.render("register", {"error": err.message});
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to YelpCamp "+ user.username);
            res.redirect("/plans");
        });
    });
});

//show login form
router.get("/login", function(req, res){
    res.render("login");
})

//login logic
//uses passport authenticate middleware
router.post("/login", passport.authenticate("local", {successRedirect: "/plans", failureRedirect: "/login"}), function(req, res){
    
});

//logout route
router.get("/logout", function(req, res){
   req.logout();  //from packages
   req.flash("success", "Logged you out!");
   res.redirect("/plans");
});

//USER PROFILES
router.get("/users/:id", function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            console.log(err.message);
            req.flash("error", err.message);
            return res.redirect("/");
        }
        console.log(foundUser);
        Plan.find().where('author.id').equals(foundUser._id).exec(function(err, plans){
            if(err){
                req.flash("error", "Something went wrong");
                return res.redirect("/");
            }
            res.render("users/show", {user: foundUser, plans: plans});
        });
    });

});

module.exports = router;