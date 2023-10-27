const SSLCommerz = require("ssl-commerz-node");
const PaymentSession = SSLCommerz.PaymentSession;
const { CartItem } = require("../models/cartItem");
const { Profile } = require("../models/profile");
const { Order } = require("../models/order");
const { Payment } = require("../models/payment");
const path = require("path");
const FormData = require("form-data");
const fetch = require("node-fetch");
// const fetch = require("node-fetch-commonjs");

//! Request a session
//! Payment process
//! Receive IPN
//! Create an order

module.exports.ipn = async (req, res) => {
    try {
        const payment = new Payment(req.body);
        const tran_id = payment["tran_id"];

        if (payment["status"] === "VALID") {
            const storeId = process.env.SSLCOMMERZ_STORE_ID;
            const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;
            const val_id = payment["val_id"];

            const formData = new FormData();
            formData.append("store_id", storeId);
            formData.append("store_passwd", storePassword);
            formData.append("val_id", val_id);

            const fetchUrl = `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${val_id}&store_id=${storeId}&store_passwd=${storePassword}&format=json`;

            const response = await fetch(fetchUrl, {
                method: "GET",
                mode: "cors",
                cache: "no-cache",
                credentials: "same-origin",
                redirect: "follow",
                referrer: "no-referrer",
            });

            const data = await response.json();

            if (data.status === "VALID") {
                const order = await Order.findOneAndUpdate(
                    { transaction_id: tran_id },
                    { status: "Complete", paymentStatus: data.status }
                );

                console.log("This is cart of the order: ", order.cartItems);

                for (const item of order.cartItems) {
                    const itemId = item._id;
                    const filter = { _id: itemId };

                    await CartItem.deleteMany(filter);
                }
            } else {
                await Order.deleteOne({ transaction_id: tran_id });
            }
        } else {
            console.log("Payment is not valid");
        }

        await payment.save();

        return res.status(200).send("IPN");
    } catch (err) {
        console.log("this is catch error => ", err);
    }
};

module.exports.initPayment = async (req, res) => {
    try {
        const userId = req.user._id;
        const discount = req.query.discount;
        const cartItems = await CartItem.find({ user: userId });
        //todo profile
        const profile = await Profile.findOne({ user: userId });
        const { address1, address2, city, state, postcode, country, phone } =
            profile;

        total_amount = 0;
        if (discount > 0) {
            total_amount = cartItems
                .map(
                    (item) =>
                        item.count * item.price -
                        (item.count * item.price * discount) / 100
                )
                .reduce((a, b) => a + b, 0);
        } else {
            total_amount = cartItems
                .map((item) => item.count * item.price)
                .reduce((a, b) => a + b, 0);
        }
        const total_item = cartItems
            .map((item) => item.count)
            .reduce((a, b) => a + b, 0);

        const tran_id =
            "_" +
            Math.random().toString(36).substr(2, 9) +
            new Date().getTime();

        //todo init payment session
        const payment = new PaymentSession(
            true,
            process.env.SSLCOMMERZ_STORE_ID,
            process.env.SSLCOMMERZ_STORE_PASSWORD
        );

        //! Set the urls
        payment.setUrls({
            success:
                "https://bohubrihi-e-com-backend-app.onrender.com/api/payment/success",
            fail: "yoursite.com/fail",
            cancel: "yoursite.com/cancel",
            ipn: "https://bohubrihi-e-com-backend-app.onrender.com/api/payment/ipn",
        });

        //! Set order details
        payment.setOrderInfo({
            total_amount: total_amount,
            currency: "BDT",
            tran_id: tran_id,
            emi_option: 0,
        });

        //! Set customer info
        payment.setCusInfo({
            name: req.user.name,
            email: req.user.email,
            add1: address1,
            add2: address2,
            city: city,
            state: state,
            postcode: postcode,
            country: country,
            phone: phone,
            fax: phone,
        });

        //! Set shipping info
        payment.setShippingInfo({
            method: "Courier",
            num_item: total_item,
            name: req.user.name,
            add1: address1,
            add2: address2,
            city: city,
            state: state,
            postcode: postcode,
            country: country,
        });

        //! Set Product Profile
        payment.setProductInfo({
            product_name: "Bohubrihi E-com Products",
            product_category: "General",
            product_profile: "general",
        });

        response = await payment.paymentInit();

        let order = new Order({
            cartItems: cartItems,
            user: userId,
            transaction_id: tran_id,
            address: profile,
        });

        if (response.status === "SUCCESS") {
            order.sessionKey = response["sessionkey"];
            await order.save();
        }
        return res.status(200).send(response);
    } catch (err) {
        console.log(err);
    }
};

module.exports.paymentSuccess = async (req, res) => {
    res.sendFile(path.join(__basedir + "/public/success.html"));
};
