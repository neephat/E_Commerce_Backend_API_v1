const router = require("express").Router();
const { getOrders } = require("../controllers/orderController");

router.route("/").get(getOrders);

module.exports = router;
