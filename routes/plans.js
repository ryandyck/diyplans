var express = require("express");
var router = express.Router();
var Plan = require("../models/plan");
//if you just require a folder, it will require the file named index, so index.js in this is optional
var middleware = require("../middleware/index.js");

//image upload config///////////////////////////////////////
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dknaropet', //dotenv is not working
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});
///////////////////////////////////////////////////////////
var filter;

/////////////////
//INDEX ROUTE
//REST convention - this is where the data is displayed
router.get("/", function(req, res){
    var noMatch;

  /*  if(req.query.filter){
        //variable regex (regular expression)
        //const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        
        const link_type = req.query.filter;
        //search for names that match the fuzzy search from the regex and only display them
        Plan.find({type: link_type}, function(err, allPlans){  //, type: link
            if(err){
                console.log(err);
            }
            else{
                if(allPlans.length < 1){
                    noMatch = "No plans were found";
                }
                res.render("plans/index", {plans: allPlans, noMatch: noMatch});
            }
        });
    }*/

    if(req.query.search){
        //variable regex (regular expression)
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        
        //const link = req.query.type_link;
        //search for names that match the fuzzy search from the regex and only display them
        Plan.find({name: regex}, function(err, allPlans){  //, type: link
            if(err){
                console.log(err);
            }
            else{
                if(allPlans.length < 1){
                    noMatch = "No plans were found";
                }
                res.render("plans/index", {plans: allPlans, noMatch: noMatch});
            }
        });
    }
    else{
        //eval(require('locus'));
        //otherwise get all plans and display
        //get all plans from db
        Plan.find({}, function(err, allPlans){
            if(err){
                console.log(err);
            }
            else{
                res.render("plans/index", {plans: allPlans, noMatch: noMatch});
            }
        });
    }
});


//CREATE ROUTE
//for REST convention, this should match the get of where the forms post data is displayed
router.post("/", middleware.isLoggedIn, upload.fields([{name: 'image'}, {name: 'drawing'}]), async function(req, res) {
    if(req.files.image.length) {
        try{
            var result1 = await cloudinary.v2.uploader.upload(req.files.image[0].path);
            // add cloudinary url for the image to the plan object under image property
            req.body.plan.image = result1.secure_url;
            //add image's public_id to plan object
            req.body.plan.imageId = result1.public_id;
            // add author to plan
            req.body.plan.author = {
              id: req.user._id,
              username: req.user.username
            };
        }catch(err){
            req.flash('error', err.message);
            console.log("error uploading image");
            return res.redirect('back');
        }
    }

    if(req.files.drawing.length) {
        try{
            var result2 = await cloudinary.v2.uploader.upload(req.files.drawing[0].path);
            // add cloudinary url for the image to the plan object under image property
            req.body.plan.drawing = result2.secure_url;
            //add image's public_id to plan object
            req.body.plan.drawingId = result2.public_id;
            // add author to plan
            req.body.plan.author = {
              id: req.user._id,
              username: req.user.username
            };
        }catch(err){
            req.flash('error', err.message);
            console.log("error uploading image");
            return res.redirect('back');
        } 
    }

    Plan.create(req.body.plan, function(err, plan) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('back');
        }
        res.redirect('/plans/' + plan.id);
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
router.put("/:id", middleware.checkPlanOwnership, upload.single('image'), function(req, res){
    //find and update the correct plan
    Plan.findById(req.params.id, async function(err, plan){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        }
        else{
            if(req.file){
                try{
                    await cloudinary.v2.uploader.destroy(plan.imageId);
                    var result = await cloudinary.v2.uploader.upload(req.file.path);
                    plan.imageId = result.public_id;
                    plan.image = result.secure_url;
                }catch(err){
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
            }
            //will either update with old values or new updated values
            plan.name = req.body.name;
            plan.description = req.body.description;
            plan.save(); // saves the plan in the database (updates it)
            req.flash("success", "Updated Plan");
            //redirect somewhere
            res.redirect("/plans/" + req.params.id);
        }
    });
});

//destroy plan route
router.delete("/:id", middleware.checkPlanOwnership, async function(req, res){
    //TODO once deleting is working, delete the comments from the database as well

    Plan.findById(req.params.id, async function(err, plan){
        if(err){
            req.flash("error", err.message);
            return res.redirect("back");  
        }
        try{
            await cloudinary.v2.uploader.destroy(plan.imageId); //delete image from cloudinary
            plan.remove();  //delete from database
            req.flash("success", "plan deleted");
            res.redirect('/plans');
        }catch(err){
            req.flash("error", err.message);
            return res.redirect("back");  
        }
    });
});

//match any characters globallys
function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;