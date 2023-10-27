const jwt = require("jsonwebtoken");

//* here we should use a try and catch. Because when the await function to verify the token is not false it is not going to the next line where we are sending a message "Invalid token", it is directly calling the central error from error.js file.

module.exports = async function (req, res, next) {
    let token = req.header("Authorization");
    if (!token) return res.status(401).send("Access denied! No token provided");
    else token = token.split(" ")[1].trim();
    try {
        const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded;
        next();
    } catch {
        // if decoded is not true then decoded => Undefined
        return res.status(400).send("Invalid token");
    }
};
