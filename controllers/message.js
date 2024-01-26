import Message from "../models/message.model.js";
import User from "../models/user.model.js";

const messageController = {
	getMessages: async (req, res) => {
		const { firstUser, secondUser } = req.query;
		try {
			const sentMessages = await Message.find({
				$and: [
					{ senderId: firstUser },
					{ recepientId: secondUser },
					{ isDeletedForSender: false },
				],
			});
			const receivedMessages = await Message.find({
				$and: [{ senderId: secondUser }, { recepientId: firstUser }],
			});
			const messages = sentMessages.concat(receivedMessages);
			messages.sort((a, b) => a.timestamp - b.timestamp);
			res.status(200).json(messages);
		} catch (error) {
			console.log("Get messages error >>>", error);
			res.status(400).json({ error: "Cannot Show Messages" });
		}
	},
	search: async (req, res) => {
		const { keyword } = req.query;
		const lowerKeyword = keyword.toLowerCase();

		const searchUsers = await User.find().select({ firstName: 1, lastName: 1 });

		const filteredUsers = searchUsers.filter(
			(user) =>
				user.firstName.toLowerCase().includes(lowerKeyword) ||
				user.lastName.toLowerCase().includes(lowerKeyword)
		);

		const searchMessages = await Message.find().select({ message: 1 });
		const filteredMessages = searchMessages.filter((message) =>
			message.message.toLowerCase().includes(lowerKeyword)
		);
		const searchResult = {
			users: filteredUsers,
			messages: filteredMessages,
		};
		res.status(200).json(searchResult);
	},
	deleteForMe: async (req, res) => {
		const { id } = req.body;
		try {
			const deleteMessage = await Message.findOneAndUpdate(
				{ _id: id },
				{ isDeletedForSender: true, isDeletedForRecepient: false }
			);
			console.log("deleteMessage >>", deleteMessage);
			res.status(200).json("Message has been deleted");
		} catch (error) {
			res.status(400).json({ error: "Cannot Delete Message" });
		}
	},

	deleteForEveryone: async (req, res) => {
		try {
			const { id } = req.body;
			const deleteMessage = await Message.deleteOne({ _id: id });
			res.status(200).json("Message has been deleted");
		} catch (error) {
			res.status(400).json({ error: "Cannot Delete Message" });
		}
	},
};

export default messageController;
