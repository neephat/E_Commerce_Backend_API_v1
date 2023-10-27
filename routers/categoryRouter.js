const router = require("express").Router();
const admin = require("../middlewares/admin");
const authorize = require("../middlewares/authorize");
const {
    createCategory,
    getCategories,
} = require("../controllers/categoryController");

router.route("/").post([authorize, admin], createCategory).get(getCategories);

module.exports = router;
