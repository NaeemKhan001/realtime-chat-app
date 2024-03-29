import express from "express";
import userController from "../controllers/user.js";
import messageController from "../controllers/message.js";
import authenticateUser from "../middlewares/authenticateUser.js";

let router = express.Router();

router.post("/register", userController.register);

// Logout API
router.get("/logout", (req, res) => {
	req.logout();
	res.status(200).json({ message: "Logout successful" });
});

router.post("/login", authenticateUser(), userController.login);

export default router;
