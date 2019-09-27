var mongoose = require("mongoose");
 
var planSchema = new mongoose.Schema({
   name: String,   //title

   type: String,  //woodwork, metal fab etc.

   image: String,  //image displayed
   imageId: String, //used by cloudinary
   
   drawing: String,  //pdf drawing (plan)
   drawingId: String,  //used by cloudinary
   
   description: String, //description of the 
   
   bom: String,  //bill of materials
   bomId: String,

   notes: String,  //additional notes about the plan
   notesId: String,

   dxf: String,
   dxfId: String,

   gCode: String,
   gCodeId: String,

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