var mongoose = require("mongoose");
 
var planSchema = new mongoose.Schema({
   name: String,
   image: String,
   imageId: String,
   type: String,  //woodwork, metal fab etc.
   drawing: String,
   description: String,
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