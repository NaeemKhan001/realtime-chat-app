import mongoose from "mongoose";

const Schema = mongoose.Schema;
let messageSchema = new mongoose.Schema(
	{
		senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
		recepientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
		message: { type: String, default: "" },
		timestamp: { type: Date, default: Date.now },
	},
	{ versionKey: false },
	{ autoIndex: false },
	{ collection: "messages" }
);
const Message = mongoose.model("Message", messageSchema);
export default Message;
