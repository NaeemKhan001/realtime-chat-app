import passport from "passport";
import bcrypt from "bcrypt";
import { Strategy as LocalStrategy } from "passport-local";
import User from "../models/user.model.js";

passport.use(
	new LocalStrategy(
		{ usernameField: "email" },
		async (email, password, done) => {
			try {
				const userEmail = email.toLowerCase();
				const user = await User.findOne({ email: userEmail });
				if (!user)
					return done(null, false, { message: "Incorrect email or password." });

				const match = await bcrypt.compare(password, user.password);
				if (match) {
					return done(null, user);
				} else {
					return done(null, false, { message: "Incorrect Email or Password." });
				}
			} catch (error) {
				return done(error);
			}
		}
	)
);

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
	try {
		const user = await User.findById(id);
		done(null, user);
	} catch (error) {
		done(error);
	}
});

function authenticateUser() {
	return async (req, res, next) => {
		passport.authenticate("local", (err, user, info) => {
			console.log("error >>", err);
			console.log("user >>", user);
			console.log("info >>", info);
			if (err) {
				return next(err);
			}
			if (!user) {
				return res.status(400).json({ message: "Un authorized" });
			}
			req.logIn(user, (err) => {
				if (err) {
					return next(err);
				}
				next();
			});
		})(req, res, next);
	};
}

export default authenticateUser;
