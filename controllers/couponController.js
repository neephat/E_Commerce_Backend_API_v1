const _ = require("lodash");
const { Coupon, validate } = require("../models/coupon");

module.exports.createCoupon = async (req, res) => {
    try {
        const { error } = validate(
            _.pick(req.body, ["name", "code", "amount"])
        );
        if (error) return res.status(400).send(error.details[0].message);

        const coupon = new Coupon(_.pick(req.body, ["name", "code", "amount"]));

        const result = await coupon.save();
        return res.status(200).send("Coupon created successfully");
    } catch (err) {
        console.log(err);
    }
};

module.exports.getCoupon = async (req, res) => {
    try {
        const code = req.body.code;
        const discount = await Coupon.find({ code: code });
        return res.status(200).send(discount);
    } catch (err) {
        console.log(err);
    }
};
