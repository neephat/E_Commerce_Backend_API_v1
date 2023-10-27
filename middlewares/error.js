//! This function is for handling async await error.
module.exports = (err, req, res, next) => {
    return res.status(500).send("Something went wrong");
};
