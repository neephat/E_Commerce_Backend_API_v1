const { Order } = require("../models/order");

module.exports.getOrders = async (req, res) => {
    try {
        const productCounts = await Order.aggregate([
            { $unwind: "$cartItems" },
            { $group: { _id: "$cartItems.product", count: { $sum: 1 } } },
        ]);

        const salesNumber = productCounts.map((p) => ({
            productId: p._id,
            count: p.count,
        }));

        return res.status(200).send(salesNumber);
    } catch (err) {
        console.log(err);
    }
};
