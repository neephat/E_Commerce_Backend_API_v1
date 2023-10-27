const router = require("express").Router();
const authorize = require("../middlewares/authorize");
const { postComment, getComment } = require("../controllers/commentController");

router.route("/").post(authorize, postComment).get(getComment);

module.exports = router;
