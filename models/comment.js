var mongoose = require("mongoose");
 
var commentSchema = new mongoose.Schema({
    text: String,
    createdAt: { type: Date, default: Date.now },
    author: {        //referencing the id is only possible because mongo is non relational, otherwise would need another table
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"  //the model that the id refers to
        },          //could just store id and lookup user, but will be printing the username a lot
        username: String
    }
});
 
module.exports = mongoose.model("Comment", commentSchema);