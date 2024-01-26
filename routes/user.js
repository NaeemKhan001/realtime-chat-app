import express from "express";
import userController from "../controllers/user.js";

let router = express.Router();

router.post("/register", userController.register);
router.post("/login", userController.login);

export default router;
