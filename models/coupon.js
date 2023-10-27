const { Schema, model } = require("mongoose");
const joi = require("joi");

module.exports.Coupon = model(
    "Coupon",
    Schema(
        {
            name: {
                type: String,
                unique: true,
            },
            code: {
                type: String,
                unique: true,
                minlength: 3,
                maxlength: 10,
            },
            amount: Number,
        },
        { timestamps: true }
    )
);

module.exports.validate = (coupon) => {
    const schema = joi.object({
        name: joi.string().required(),
        code: joi.string().min(3).max(10).required(),
        amount: joi.number().required(),
    });
    return schema.validate(coupon);
};
