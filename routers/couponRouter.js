const router = require("express").Router();
const admin = require("../middlewares/admin");
const authorize = require("../middlewares/authorize");
const { createCoupon, getCoupon } = require("../controllers/couponController");

router.route("/").post([authorize, admin], createCoupon);
router.route("/get").post(getCoupon);

module.exports = router;
