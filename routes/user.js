import express from "express";
import userController from "../controllers/user.js";

let router = express.Router();

router.post("/register", userController.register);

export default router;
