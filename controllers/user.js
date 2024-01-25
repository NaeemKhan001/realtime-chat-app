import User from "../models/user.model.js";
import crypto from "bcrypt";
const saltRounds = 6;
const userController = {
	register: async (req, res) => {
		const { firstName, lastName, email, password } = req.body;
		let userEmail = email.toLowerCase();
		try {
			if ((!firstName, !lastName, !email, !password)) {
				return res.status(400).json({ error: "One or more fields missing." });
			} else {
				const existingUserByEmail = await User.findOne({ email: userEmail });
				if (existingUserByEmail) {
					return res
						.status(400)
						.json({ error: "User Already exists with this email" });
				} else if (password.length < 6) {
					return res
						.status(400)
						.json({ error: "Password must be at least 6 characters long." });
				} else {
					let encryptedPassword = crypto.hashSync(password, saltRounds);
					const data = {
						firstName: firstName,
						lastName: lastName,
						email: userEmail,
						password: encryptedPassword,
					};
					const newUser = new User(data);
					const user = await newUser.save();
					const userObj = {
						...user?._doc,
					};
					delete userObj?.password;
					return res.status(200).json({ userObj });
				}
			}
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	},
};

export default userController;
