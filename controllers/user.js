import User from "../models/user.model.js";
import bcrypt from "bcrypt";

const userController = {
	// User Registration API
	register: async (req, res) => {
		const { firstName, lastName, email, password } = req.body;
		const userEmail = email.toLowerCase();

		try {
			const existingUser = await User.findOne({ email: userEmail });
			if (existingUser) {
				return res
					.status(400)
					.json({ error: "User already exists with this email" });
			}
			const hashedPassword = await bcrypt.hash(password, 10);
			const newUser = new User({
				firstName,
				lastName,
				email: userEmail,
				password: hashedPassword,
			});
			await newUser.save();

			res.status(200).json({ message: "User registered successfully" });
		} catch (error) {
			console.error("Error during registration:", error);
			res.status(500).json({ error: "Internal Server Error" });
		}
	},
	login: async (req, res) => {
		const { email, password } = req.body;
		let userEmail = email.toLowerCase();
		try {
			if (!email || !password) {
				return res.status(400).json({ error: "One or more fields missing." });
			} else {
				let existingUserByEmail = await User.findOne({ email: userEmail });
				if (!existingUserByEmail) {
					return res
						.status(400)
						.json({ error: "Email or Password is Incorrect." });
				} else {
					const matchPassword = bcrypt.compare(
						password,
						existingUserByEmail.password
					);
					if (!matchPassword) {
						return res
							.status(400)
							.json({ error: "Email or Password is Incorrect." });
					} else {
						const userObj = {
							...existingUserByEmail?._doc,
						};
						delete userObj?.password;
						return res.status(200).json({ userObj });
					}
				}
			}
		} catch (error) {
			return res.status(500).json({ error: error.message });
		}
	},
};

export default userController;
