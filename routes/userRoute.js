const express = require("express");
const userController = require("./../controllers/userController");
const router = express.Router();//similar to app except mini app for specific route of user


router.route("/").get(userController.getAllUsers).post(userController.createUser);
router.route("/:id").get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);

module.exports = router;