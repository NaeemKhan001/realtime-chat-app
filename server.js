import express from "express";
import passport from "passport";
import session from "express-session";
import mongoose from "mongoose";
import connectMongo from "connect-mongo";
import dotenv from "dotenv";
import router from "./routes/index.js";
import webSockets from "./helpers/sockets.js";

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

app.use("/api", router);

const server = app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});

webSockets(server);
