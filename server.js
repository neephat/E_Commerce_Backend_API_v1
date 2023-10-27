require("dotenv/config");
const mongoose = require("mongoose");
const app = require("./app");

global.__basedir = __dirname;

const mongoDB = process.env.MONGODB_SERVER.replace(
    "<password>",
    process.env.MONGODB_PASSWORD
);

mongoose
    .connect(mongoDB)
    .then(() => console.log("Successfully connected to MongoDB"))
    .catch((err) => console.log(err, "MongoDB connection Failed!"));

const port = process.env.PORT || 3001;

app.listen(port, () => {
    console.log(`Backend App running on port ${port}`);
});
