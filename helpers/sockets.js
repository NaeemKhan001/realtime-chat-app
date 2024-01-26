import { Server } from "socket.io";
import Message from "../models/message.model.js";
const webSockets = (server) => {
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

				if (recipientSocket) {
					// If recipient is connected, emit the message directly to them
					recipientSocket.emit("chat message", {
						senderId: userId,
						message: newMessage.message,
						timestamp: newMessage.timestamp,
					});
				} else {
					console.log("Recipient is not connected");
				}
			} catch (error) {
				console.error("Error storing message:", error);
			}
		});

		socket.on("disconnect", () => {
			console.log(`User ${userId} disconnected`);
		});
	});

	function findSocketByUserId(io, userId) {
		const sockets = io.sockets.sockets;
		console.log("findSocketByUserId sockets >>", userId);
		const result = [];
		sockets?.forEach((socket) => {
			if (socket.handshake.query.userId == userId) {
				result.push(socket);
			}
		});
		return result?.[0] || null;
	}

	async function sendStoredMessages(socket, userId) {
		try {
			const storedMessages = await Message.find({ recepientId: userId });

			// Emit each stored message to the user
			storedMessages.forEach((storedMessage) => {
				socket.emit("chat message", {
					senderId: storedMessage.senderId,
					message: storedMessage.message,
					timestamp: storedMessage.timestamp,
				});
			});
		} catch (error) {
			console.error("Error sending stored messages:", error);
		}
	}
};

export default webSockets;
