var mongoose = require("mongoose");
 
var planSchema = new mongoose.Schema({
   name: String,   //title
   
   image: String,  //image displayed
   imageId: String, //used by cloudinary
   
   type: String,  //woodwork, metal fab etc.
   
   drawing: String,  //pdf drawing (plan)
   drawingId: String,  //used by cloudinary
   
   description: String, //description of the 
   
   createdAt: { type: Date, default: Date.now },  //moment it was created

   author: {  //user account info, plans are linked to users through this
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   },
   
   comments: [      //all the comments, used to link comments to plans
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ]

});
 
module.exports = mongoose.model("Plan", planSchema);