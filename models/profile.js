const { Schema, model } = require("mongoose");

module.exports.Profile = model(
    "profile",
    Schema({
        user: {
            type: Schema.Types.ObjectId,
            unique: true,
            required: true,
            ref: "User",
        },
        phone: String,
        address1: String,
        address2: String,
        city: String,
        state: String,
        postcode: Number,
        country: String,
    })
);
//* the fields needed for sslcommerze payment are written here. You can add more.

