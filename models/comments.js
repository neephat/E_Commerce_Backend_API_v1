const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    user: String,
    comment: String,
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
});

const Comments = mongoose.model("comment", commentSchema);

module.exports = Comments;
