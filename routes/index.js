import express from "express";
import user from "./user.js";
import message from "./message.js";

let router = express.Router();

router.use("/user", user);
router.use("/message", message);

router.use(function (err, req, res, next) {
	if (err.name === "ValidationError") {
		return res.status(422).json({
			errors: Object.keys(err.errors).reduce(function (errors, key) {
				errors[key] = err.errors[key].message;
				return errors;
			}, {}),
		});
	}

	return next(err);
});
export default router;
