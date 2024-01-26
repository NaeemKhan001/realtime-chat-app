// app.js
import express from "express";
import passport from "passport";
import session from "express-session";
import bcrypt from "bcrypt";
import { Strategy as LocalStrategy } from "passport-local";
import mongoose from "mongoose";
import connectMongo from "connect-mongo";
// import socketio from "socket.io";
import { Server } from "socket.io";
import dotenv from "dotenv";

import User from "./models/user.model.js"; // Import your User model
import Message from "./models/message.model.js"; // Import your Message model

dotenv.config();

const dbString = `mongodb://${process.env.DB_SERVER}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(dbString, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("Connected to MongoDB"));

const sessionStore = connectMongo.create({
	mongoUrl: dbString,
	mongooseConnection: mongoose.connection,
	autoRemove: "native", // Optional: Auto-remove expired sessions
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
	session({
		secret: "testsecret",
		resave: true,
		saveUninitialized: true,
		store: sessionStore,
	})
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
	new LocalStrategy(
		{ usernameField: "email" },
		async (email, password, done) => {
			try {
				const user = await User.findOne({ email });
				if (!user)
					return done(null, false, { message: "Incorrect email or password." });

				const match = await bcrypt.compare(password, user.password);
				if (match) {
					return done(null, user);
				} else {
					return done(null, false, { message: "Incorrect email or password." });
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

// User Registration API
app.post("/api/signup", async (req, res) => {
	const { firstName, lastName, email, password } = req.body;

	try {
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ error: "Email already taken" });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const newUser = new User({
			firstName,
			lastName,
			email,
			password: hashedPassword,
		});
		await newUser.save();

		res.status(201).json({ message: "User registered successfully" });
	} catch (error) {
		console.error("Error during registration:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// User Authentication API
app.post("/api/login", (req, res, next) => {
	passport.authenticate("local", (err, user, info) => {
		console.log("error >>", err);
		console.log("user >>", user);
		console.log("info >>", info);
		if (err) {
			return next(err);
		}
		if (!user) {
			return res.status(400).json({ message: "Incorrect email or password." });
		}
		req.logIn(user, (err) => {
			if (err) {
				return next(err);
			}
			return res.status(200).json({ message: "Login successful" });
		});
	})(req, res, next);
});

// Logout API
app.get("/api/logout", (req, res) => {
	req.logout();
	res.status(200).json({ message: "Logout successful" });
});

// Dashboard API (requires authentication)
app.get("/api/dashboard", (req, res) => {
	if (req.isAuthenticated()) {
		res.status(200).json({ message: `Welcome, ${req.user.email}!` });
	} else {
		res.status(401).json({ message: "Unauthorized" });
	}
});

const server = app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});

// const socketio = require("socket.io");
const io = new Server(server);

// Chat API
io.on("connection", (socket) => {
	const userId = socket.handshake.query.userId;
	console.log(`User ${userId} connected`);

	// Send stored messages to the user if any
	sendStoredMessages(socket, userId);

	socket.on("chat message", async (msg) => {
		try {
			console.log("msg >>", msg);
			const msgData = typeof msg === "string" ? JSON.parse(msg) : msg;
			// Store the message in the database
			const newMessage = new Message({
				senderId: userId,
				recepientId: msgData?.recepientId || null,
				message: msgData?.message,
			});

			await newMessage.save();

			// Check if the recipient is currently connected
			const recipientSocket = findSocketByUserId(io, msgData?.recepientId);
			// console.log("recipientSocket >>", recipientSocket);

			if (recipientSocket) {
				// If recipient is connected, emit the message directly to them
				recipientSocket.emit("chat message", {
					senderId: userId,
					message: newMessage.message,
					timestamp: newMessage.timestamp,
				});
			} else {
				// If recipient is not connected, store the message as pending
				storePendingMessage(msgData.recepientId, newMessage);
			}
		} catch (error) {
			console.error("Error storing message:", error);
		}
	});

	socket.on("disconnect", () => {
		console.log(`User ${userId} disconnected`);
	});
});

// Utility functions
function findSocketByUserId(io, userId) {
	const sockets = io.sockets.sockets;
	console.log("findSocketByUserId sockets >>", userId);
	const result = [];
	sockets?.forEach((socket) => {
		console.log(
			"findSocketByUserId socket.handshake.query >>",
			socket.handshake.query?.userId
		);
		if (socket.handshake.query.userId == userId) {
			result.push(socket);
		}
	});
	return result?.[0] || null;
}

function storePendingMessage(userId, message) {
	// Implement your own logic to store pending messages for users who are not currently connected
	// You can use a database or any other storage mechanism for this purpose
	// For simplicity, you might store pending messages in an array or another collection
	// and retrieve them when the user logs in or connects
	// Example: pendingMessages[userId].push(message);
	// This function needs to be implemented based on your application's storage requirements
}

async function sendStoredMessages(socket, userId) {
	try {
		// Retrieve stored messages for the user from the database
		const storedMessages = await Message.find({ recepientId: userId });

		// Emit each stored message to the user
		storedMessages.forEach((storedMessage) => {
			socket.emit("chat message", {
				senderId: storedMessage.senderId,
				message: storedMessage.message,
				timestamp: storedMessage.timestamp,
			});
		});

		// Clear the stored messages for the user
		await Message.deleteMany({ recepientId: userId });
	} catch (error) {
		console.error("Error sending stored messages:", error);
	}
}
