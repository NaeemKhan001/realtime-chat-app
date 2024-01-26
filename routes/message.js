import express from "express";
import userController from "../controllers/user.js";
import messageController from "../controllers/message.js";
import authenticateUser from "../middlewares/authenticateUser.js";

let router = express.Router();

router.get("/showAllMessages", messageController.getMessages);

router.post("/deleteForEveryone", messageController.deleteForEveryone);

router.post("/deleteForMe", messageController.deleteForMe);

router.get("/search", messageController.search);

export default router;
