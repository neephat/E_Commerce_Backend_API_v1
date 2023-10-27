const { Schema, model } = require("mongoose");
const joi = require("joi");

module.exports.Product = model(
    "Product",
    Schema(
        {
            name: String,
            description: String,
            price: Number,
            category: {
                type: Schema.Types.ObjectId,
                ref: "Category",
                required: true,
            },
            quantity: Number,
            photo: {
                data: Buffer,
                contentType: String,
            },
        },
        { timestamps: true }
    )
);

module.exports.validate = (product) => {
    // console.log("joi validation", product);
    const schema = joi.object({
        name: joi.string().min(3).max(255).required(),
        description: joi.string().max(2000).required(),
        price: joi.number().required(),
        category: joi.string().required(),
        quantity: joi.number().required(),
    });
    return schema.validate(product);
};
