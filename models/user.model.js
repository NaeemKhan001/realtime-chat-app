import mongoose from "mongoose";

let userSchema = new mongoose.Schema(
	{
		firstName: { type: String, default: "" },
		lastName: { type: String, default: "" },
		email: { type: String, unique: true, required: true },
		password: { type: String, required: true },
	},
	{ versionKey: false },
	{ autoIndex: false },
	{ collection: "users" }
);
const User = mongoose.model("User", userSchema);
export default User;
