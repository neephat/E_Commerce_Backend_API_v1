const userRouter = require("../routers/userRouter");
const categoryRouter = require("../routers/categoryRouter");
const productRouter = require("../routers/productRouter");
const cartRouter = require("../routers/cartRouter");
const profileRouter = require("../routers/profileRouter");
const paymentRouter = require("../routers/paymentRouter");
//todo ==> modifications
const commentRouter = require("../routers/commentRouter");
const orderRouter = require("../routers/orderRouter");
const couponRouter = require("../routers/couponRouter");

module.exports = (app) => {
    app.use("/api/user", userRouter);
    app.use("/api/category", categoryRouter);
    app.use("/api/product", productRouter);
    app.use("/api/cart", cartRouter);
    app.use("/api/profile", profileRouter);
    app.use("/api/payment", paymentRouter);
    //todo ==> modifications
    app.use("/api/comment", commentRouter);
    app.use("/api/orders", orderRouter);
    app.use("/api/coupon", couponRouter);
};
