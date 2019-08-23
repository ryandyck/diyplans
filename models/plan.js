var mongoose = require("mongoose");
 
var planSchema = new mongoose.Schema({
   name: String,
   image: String,
   imageId: String, //used by cloudinary
   type: String,  //woodwork, metal fab etc.
   drawing: String,
   drawingId: String,  //used by cloudinary
   description: String,
   createdAt: { type: Date, default: Date.now },
   author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   },
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ]
});
 
module.exports = mongoose.model("Plan", planSchema);