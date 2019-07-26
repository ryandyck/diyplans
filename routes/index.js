var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Plan = require("../models/plan");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
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


//NOTE ABOUT PASS RESET:
//avast antivirus may cause a self signed certificate in certificate chain err
//turn off mail shield to fix this

// forgot password
router.get('/forgot', function(req, res) {
  res.render('forgot');
});

//forgot password form
router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: "diy.plans.ca@gmail.com",
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: "diy.plans.ca@gmail.com",
        subject: 'DIY Plans Password Reset',
        text: "You are receiving this message because you (or someone else) has requested a password reset.\n\n" +
                "Please click on the following link, or paste this into your browser to complete the process\n\n" +
                "http://" + req.headers.host + "/reset/" + token + "\n\n"
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

//reset password page
router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});

//reset password form
router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      //process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        tls: { rejectUnauthorized: false },
        auth: {
          user: 'diy.plans.ca@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'diy.plans.ca@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/plans');
  });
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