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
    // accept image files only  //TURN OFF IMAGE CHECKS FOR NOW
/*    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }*/
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

/////////////////
//INDEX ROUTE
//REST convention - this is where the data is displayed
router.get("/", async function(req, res){
    var noMatch;
    var allPlans;

    if(req.query.search || req.query.filter){
        //variable regex (regular expression)
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        
        try{
            if(req.query.search && req.query.filter != "no_filter"){
                allPlans = await Plan.find({name: regex, type: req.query.filter});     
            }
            else if(req.query.filter != "no_filter"){
                allPlans = await Plan.find({type: req.query.filter});     
            }
            else{
                allPlans = await Plan.find({name: regex});       
            }
            if(allPlans.length < 1){
                noMatch = "No plans were found";
            }
            res.render("plans/index", {plans: allPlans, noMatch: noMatch});
        }catch(err){
            console.log(err);
        }
        //const link = req.query.type_link;
        //search for names that match the fuzzy search from the regex and only display them
        // Plan.find({name: regex}, function(err, allPlans){  //, type: link
        //     if(err){
        //         console.log(err);
        //     }
        //     else{
        //         if(allPlans.length < 1){
        //             noMatch = "No plans were found";
        //         }
        //         res.render("plans/index", {plans: allPlans, noMatch: noMatch});
        //     }
        // });
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
router.post("/", middleware.isLoggedIn, upload.fields([{name: 'image'}, {name: 'drawing'}, {name: 'bom'}, {name: 'notes'}, {name: 'g_code'}, {name: 'dxf_file'}]), async function(req, res) {
    
    if(typeof req.files.image !== 'undefined') {
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

    //this is required so set the author in this one
    if(typeof req.files.drawing !== 'undefined') {
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

    if(typeof req.files.bom !== 'undefined') {
        try{
            var result3 = await cloudinary.v2.uploader.upload(req.files.bom[0].path, { resource_type: "raw" });
            // add cloudinary url for the image to the plan object under image property
            req.body.plan.bom = result3.secure_url;
            //add image's public_id to plan object
            req.body.plan.bomId = result3.public_id;
            // add author to plan
            req.body.plan.author = {
              id: req.user._id,
              username: req.user.username
            };
        }catch(err){
            req.flash('error', err.message);
            console.log("error uploading bom");
            return res.redirect('back');
        } 
    }

    if(typeof req.files.notes !== 'undefined') {
        try{
            var result4 = await cloudinary.v2.uploader.upload(req.files.notes[0].path, { resource_type: "raw" });  //non images needs resource type set
            // add cloudinary url for the image to the plan object under image property
            req.body.plan.notes = result4.secure_url;
            //add image's public_id to plan object
            req.body.plan.notesId = result4.public_id;
            // add author to plan
            req.body.plan.author = {
              id: req.user._id,
              username: req.user.username
            };
        }catch(err){
            req.flash('error', err.message);
            console.log("error uploading notes");
            return res.redirect('back');
        } 
    }

    if(typeof req.files.g_code !== 'undefined') {
        try{
            var result5 = await cloudinary.v2.uploader.upload(req.files.g_code[0].path, { resource_type: "raw" });
            // add cloudinary url for the image to the plan object under image property
            req.body.plan.gCode = result5.secure_url;
            //add image's public_id to plan object
            req.body.plan.gCodeId = result5.public_id;
            // add author to plan
            req.body.plan.author = {
              id: req.user._id,
              username: req.user.username
            };
        }catch(err){
            req.flash('error', err.message);
            console.log("error uploading g code");
            return res.redirect('back');
        } 
    }

    if(typeof req.files.dxf_file !== 'undefined') {
        try{
            var result6 = await cloudinary.v2.uploader.upload(req.files.dxf_file[0].path, { resource_type: "raw" });
            // add cloudinary url for the image to the plan object under image property
            req.body.plan.dxf = result6.secure_url;
            //add image's public_id to plan object
            req.body.plan.dxfId = result6.public_id;
            // add author to plan
            req.body.plan.author = {
              id: req.user._id,
              username: req.user.username
            };
        }catch(err){
            req.flash('error', err.message);
            console.log("error uploading dxf file");
            return res.redirect('back');
        } 
    }

    //if any errors, do not create plan -- I think the previous returns break out so that is the case
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
router.get("/:id", async function(req, res){
    //find the plan
    Plan.findById(req.params.id).populate("comments").exec( async function(err, foundPlan){
       if(err || !foundPlan){
           req.flash("error", "Plan not found");
           res.redirect("back");
       }
       else{
           console.log(foundPlan);
           //render show template with that plan
           try{
                //var drawingThumbnail = await cloudinary.image(foundPlan.drawingId, { format: 'png' });  //this return img src 'path'
                //var drawingImage = await cloudinary.url(foundPlan.drawingId, { format: 'png' });  //this returns a url path
                var drawingThumbnail = await cloudinary.url(foundPlan.drawingId, {format: 'png', width: 200, height: 250, crop: "fill"});  //this returns a url path
           }catch(err){
                console.log("DIDNT CONVERT DA IMAGE");
           }
           console.log(drawingThumbnail);
           //console.log(drawingImage);  //thumbnail is needed to get here because need to convert to image
           res.render("plans/show", {plan: foundPlan, drawingThumbnail: drawingThumbnail}); //, drawingImage: drawingImage
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
router.put("/:id", middleware.checkPlanOwnership, upload.fields([{name: 'image'}, {name: 'drawing'}, {name: 'bom'}, {name: 'notes'}, {name: 'g_code'}, {name: 'dxf_file'}]), function(req, res){
    //find and update the correct plan
    Plan.findById(req.params.id, async function(err, plan){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        }
        else{
            if(typeof req.files.image !== 'undefined'){
                try{
                    if(plan.imageId){  //if exists already, remove the old one
                      await cloudinary.v2.uploader.destroy(plan.imageId);
                    }
                    var result1 = await cloudinary.v2.uploader.upload(req.files.image[0].path);
                    plan.imageId = result1.public_id;
                    plan.image = result1.secure_url;
                }catch(err){
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
            }
            if(typeof req.files.drawing !== 'undefined'){
                try{
                    if(plan.drawingId){  
                      await cloudinary.v2.uploader.destroy(plan.drawingId);
                    }
                    var result2 = await cloudinary.v2.uploader.upload(req.files.drawing[0].path);
                    plan.drawingId = result2.public_id;
                    plan.drawing = result2.secure_url;
                }catch(err){
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
            }
            if(typeof req.files.bom !== 'undefined'){
                try{
                    if(plan.bomId){  
                      await cloudinary.v2.uploader.destroy(plan.bomId);
                    }
                    var result3 = await cloudinary.v2.uploader.upload(req.files.bom[0].path, { resource_type: "raw" });
                    plan.bomId = result3.public_id;
                    plan.bom = result3.secure_url;
                }catch(err){
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
            }
            if(typeof req.files.notes !== 'undefined'){
                try{
                    if(plan.notesId){
                      await cloudinary.v2.uploader.destroy(plan.notesId);
                    }
                    var result4 = await cloudinary.v2.uploader.upload(req.files.notes[0].path, { resource_type: "raw" });
                    plan.notesId = result4.public_id;
                    plan.notes = result4.secure_url;
                }catch(err){
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
            }
            if(typeof req.files.g_code !== 'undefined'){
                try{
                    if(plan.gCodeId){
                      await cloudinary.v2.uploader.destroy(plan.gCodeId);
                    }
                    var result5 = await cloudinary.v2.uploader.upload(req.files.g_code[0].path, { resource_type: "raw" });
                    plan.gCodeId = result5.public_id;
                    plan.gCode = result5.secure_url;
                }catch(err){
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
            }
            if(typeof req.files.dxf_file !== 'undefined'){
                try{
                    if(plan.dxfId){
                      await cloudinary.v2.uploader.destroy(plan.dxfId);
                    }
                    var result6 = await cloudinary.v2.uploader.upload(req.files.dxf_file[0].path, { resource_type: "raw" });
                    plan.dxfId = result6.public_id;
                    plan.dxf = result6.secure_url;
                }catch(err){
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
            }

            //will either update with old values or new updated values
            plan.name = req.body.name;
            plan.description = req.body.description;
            plan.type = req.body.type;
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
            if(plan.imageId){
              await cloudinary.v2.uploader.destroy(plan.imageId); //delete image from cloudinary
            }
            if(plan.drawingId){
              await cloudinary.v2.uploader.destroy(plan.drawingId); //delete drawing from cloudinary
            }
            if(plan.bomId){
              await cloudinary.v2.uploader.destroy(plan.bomId, { resource_type: "raw" }); //delete drawing from cloudinary
            }
            if(plan.notesId){
              await cloudinary.v2.uploader.destroy(plan.notesId, { resource_type: "raw" }); //delete drawing from cloudinary
            }
            if(plan.gCodeId){
              await cloudinary.v2.uploader.destroy(plan.gCodeId, { resource_type: "raw" }); //delete drawing from cloudinary
            }
            if(plan.dxfId){
              await cloudinary.v2.uploader.destroy(plan.dxfId, { resource_type: "raw" }); //delete drawing from cloudinary
            }
            await plan.remove();  //delete from database
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

//if you pass an object you are passing a reference to the object and it is 
//possible to modify the contents of the object, however you cannot overwrite the entire object
//so can modify the path.contents
/*function cloudinaryUpload(req, ){
    var result2 = await cloudinary.v2.uploader.upload(req.files.drawing[0].path);
    // add cloudinary url for the image to the plan object under image property
    req.body.plan.drawing = result2.secure_url;
    //add image's public_id to plan object
    req.body.plan.drawingId = result2.public_id;
};*/

// function catchErr(req, res, err){
//     req.flash('error', err.message);
//     console.log("error uploading image");
//     return res.redirect('back');
// };

module.exports = router;