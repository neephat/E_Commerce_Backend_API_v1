const fs = require("fs");
const _ = require("lodash");
const formidable = require("formidable");
const { Product, validate } = require("../models/products");
const { Order } = require("../models/order");
const Comments = require("../models/comments");

//! ------------ CREATING PRODUCT -------------
module.exports.createProduct = async (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        // console.log("Form Field", fields);
        if (err) return res.status(400).send("Something went wrong");
        for (key in fields) {
            fields[key] = fields[key][0];
        }
        // console.log(fields);
        const { error } = validate(
            _.pick(fields, [
                "name",
                "description",
                "price",
                "category",
                "quantity",
            ])
        );
        if (error) return res.status(400).send(error.details[0].message);

        const product = new Product(fields);

        if (files.photo) {
            fs.readFile(files.photo[0].filepath, async (err, data) => {
                if (err)
                    return res.status(400).send("Problem in the file data");
                product.photo.data = data;
                product.photo.contentType = files.photo.type;

                try {
                    const result = await product.save();
                    console.log(result);
                    return res.status(201).send({
                        message: "product created successfully",
                        data: _.pick(result, [
                            "name",
                            "description",
                            "price",
                            "category",
                            "quantity",
                        ]),
                    });
                } catch (e) {
                    // console.log(e._message);
                    return res.status(500).send("Internal Server error");
                }
            });
        } else {
            return res.status(400).send("No photo provided");
        }
    });
};

//! --------- CREATING PRODUCT LIST -------------

//* Query String
//* query --> api/product?order=desc&sortBy=name&limit=10
module.exports.getProducts = async (req, res) => {
    // console.log(req.query);
    let order = req.query.order === "desc" ? -1 : 1;
    let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
    let limit = req.query.limit ? parseInt(req.query.limit) : 4;
    //todo ==>> modified --> skip
    let skip = req.query.skip || 0;

    const products = await Product.find()
        .select({ photo: 0, description: 0 })
        .sort({ [sortBy]: order }) //* if you want to use variable as property name write this inside a [].
        .limit(limit)
        .skip(skip * limit)
        .populate("category", "name");
    // .populate("category","name createdAt");
    return res.status(200).send(products);
};

//!--------------- get product by ID ----------------------
module.exports.getProductById = async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId)
        .select({ photo: 0 })
        .populate("category", "name");
    if (!product) res.status(404).send("Not found");
    return res.status(200).send(product);
};

// ! -------------------- Function for getting photos. -------------------------
module.exports.getPhoto = async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId)
        // .select('photo -_id')
        .select({
            photo: 1,
            _id: 0,
        });
    res.set("Content-Type", product.photo.contentType);
    return res.status(200).send(product.photo.data);
};

// ! -------------------- Function for updating product -------------------------

//* Get product by id
//* Collect form data
//* Update provided form field
//* Update photo (If provided)

module.exports.updateProductById = async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) return res.status(400).send("Something went wrong");
        for (key in fields) {
            fields[key] = fields[key][0];
        }
        const updatedFields = _.pick(fields, [
            "name",
            "description",
            "price",
            "category",
            "quantity",
        ]);
        _.assignIn(product, updatedFields);

        if (files.photo) {
            fs.readFile(files.photo[0].path, async (err, data) => {
                if (err) return res.status(400).send("Something went wrong");
                product.photo.data = data;
                product.photo.contentType = files.photo.type;

                try {
                    const result = await product.save();
                    return res.status(201).send({
                        message: "product updated successfully",
                    });
                } catch (e) {
                    return res.status(500).send("Internal Server error");
                }
            });
        } else {
            try {
                const result = product.save();
                return res.status(201).send({
                    message: "product updated successfully",
                });
            } catch (e) {
                return res.status(500).send("Internal Server error");
            }
        }
    });
};

//! --------------- Filter by any fields --------------
// const body = {
//     order: "desc",
//     sortBy: "price",
//     limit: 6,
//     skip: 20,
//     filters: {
//         price: [1000, 2000],
//         category: ["sfjsdf432434kj343", "sklfiej4n444l", "dafjsj453n3"],
//     },
// };

module.exports.filterProducts = async (req, res) => {
    let order = req.body.order === "desc" ? -1 : 1;
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    let limit = req.body.limit ? parseInt(req.body.limit) : 10;
    let skip = parseInt(req.body.skip);

    let filters = req.body.filters;
    let args = {};

    // This filter is done according to mongoDB filter rules.
    for (let key in filters) {
        if (filters[key].length > 0) {
            if (key === "price") {
                //* { price: { $gte:0, $lte: 500 } }
                //* arguments:  { price: { '$gte': 500, '$lte': 1000 } }

                args["price"] = {
                    $gte: filters["price"][0],
                    $lte: filters["price"][1],
                };
                console.log("arguments: ", args);
            }
            if (key === "category") {
                //* category: { $in: [''] }
                //* category: { '$in': [ 'sfjsdf432434kj343', 'sklfiej4n444l', 'dafjsj453n3' ] }

                args["category"] = {
                    $in: filters["category"],
                };
                console.log("Category filtered: ", args);
            }
        }
    }
    console.log("This is arg for product filtering: ", args);

    const products = await Product.find(args)
        .select({ photo: 0 })
        .populate("category", "name")
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit);
    return res.status(200).send(products);
};

//todo ==> ------------ Modifications ----------------

module.exports.getOrderedProducts = async (req, res) => {
    let order = req.body.order === "asc" ? 1 : -1;
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";

    const products = await Product.find()
        .select({ photo: 0 })
        .populate("category", "name")
        .sort({ [sortBy]: order });
    try {
        return res.status(200).send(products);
    } catch (err) {
        console.log(err);
    }
};

module.exports.getProductsSortedByPrice = async (req, res) => {
    let option = req.body.option;

    try {
        const products = await Product.find().sort({ price: -1 });
        return res.status(200).send(products);
    } catch (err) {
        console.log(err);
    }
};

module.exports.getProductsSortedBySold = async (req, res) => {
    const productCounts = await Order.aggregate([
        { $unwind: "$cartItems" },
        { $group: { _id: "$cartItems.product", count: { $sum: 1 } } },
    ]);

    const productSales = productCounts.map((item) => ({
        productId: item._id,
        count: item.count,
    }));

    const products = await Product.find();

    products.forEach((product) => {
        const sales = productSales.find(
            (id) => id.productId.toString() === product._id.toString()
        );
        product.salesCount = sales ? sales.count : 0;
    });

    products.sort((a, b) => b.salesCount - a.salesCount);

    return res.status(200).send(products);

    //!--------------------------- products that are sold ---------------------------------
    // const productCounts = await Order.aggregate([
    //     { $unwind: "$cartItems" },
    //     { $group: { _id: "$cartItems.product", count: { $sum: 1 } } },
    //     { $sort: { count: -1 } },
    // ]);
    // const productIds = productCounts.map((p) => p._id);
    // const products = await Product.find({ _id: { $in: productIds } });
    // products.sort((a, b) => {
    //     const aIndex = productIds.indexOf(a._id);
    //     const bIndex = productIds.indexOf(b._id);
    //     return aIndex - bIndex;
    // });
    // return res.status(200).send(products);
};

//todo ==>> Reviews
module.exports.getProductsSortedByReviews = async (req, res) => {
    try {
        const products = await Product.aggregate([
            {
                $lookup: {
                    from: "comments", //! =>> Name of the Comment collection showed in mongoDB database.
                    localField: "_id",
                    foreignField: "product",
                    as: "comments",
                },
            },
            {
                $addFields: {
                    commentCount: { $size: "$comments" },
                },
            },
            {
                $sort: { commentCount: -1 },
            },
        ]);
        return res.status(200).send(products);
    } catch (err) {
        console.log(err);
    }
};
//todo ==>> Reviews Alternative
// module.exports.getProductsSortedByReviews = async (req, res) => {
//     try {
//         const products = await Product.aggregate([
//             {
//                 $lookup: {
//                     from: "comments",
//                     localField: "_id",
//                     foreignField: "product",
//                     as: "comments",
//                 },
//             },
//             {
//                 $project: {
//                     _id: 1,
//                     name: 1,
//                     description: 1,
//                     price: 1,
//                     category: 1,
//                     quantity: 1,
//                     commentCount: { $size: "$comments" },
//                 },
//             },
//             { $sort: { commentCount: -1 } },
//         ]);

//         return res.status(200).send(products);
//     } catch (error) {
//         console.log(error);
//     }
// };

//*---------- Searching products ------------------

module.exports.getSearchedProduct = async (req, res) => {
    try {
        const { product } = req.body;

        const products = await Product.find({
            name: { $regex: product, $options: "i" },
        }).sort({ name: 1 });

        return res.status(200).send(products);
    } catch (err) {
        console.log(err);
    }
};
