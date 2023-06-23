import Group from "../models/Group.js";
import Group_Chat from "../models/Group_Chat.js";
import Message from "../models/Message.js";
import Room_Chat from "../models/Room_Chat.js";
import User from "../models/User.js";
import Friends from "../models/Friends.js";
import { Op, Sequelize } from "sequelize";
import fs from "fs";

// Room Chat
export const sendRoomMessage = async (req, res) => {
  const { id } = req.user;
  const { receiverId } = req.params;
  const { message } = req.body;
  try {
    if (!message)
      return res.status(400).json({ message: "message field is empty" });

    const receiver = await User.findOne({
      where: { id: receiverId },
    });
    if (!receiver) return res.status(404).json({ message: "User not found" });

    const checkFriend = await Friends.findOne({
      where: {
        sender_id: { [Op.or]: [receiverId, id] },
        receiver_id: { [Op.or]: [id, receiverId] },
        status: "accepted",
      },
    });
    if (!checkFriend)
      return res.status(400).json({
        message: "You cannot send messages! Please add the user first.",
      });

    const newMessage = await Message.create({
      sender_id: id,
      receiver_id: receiverId,
      message,
      img_url: req.file ? req.file.filename : "default.png",
      Room_Group: "Room",
    });

    const room = await Room_Chat.findAll({
      where: {
        sender_id: { [Op.or]: [receiverId, id] },
        receiver_id: { [Op.or]: [id, receiverId] },
      },
    });
    if (room.length < 1) {
      await Room_Chat.create({
        sender_id: id,
        receiver_id: receiverId,
        message_id: newMessage.id,
        room_id: id.toString() + receiverId.toString(),
      });
    } else {
      await Room_Chat.create({
        sender_id: id,
        receiver_id: receiverId,
        message_id: newMessage.id,
        room_id: room[0].room_id,
      });
    }

    let msg = { message, newMessage };
    req.io.emit("room_chat", msg);

    return res
      .status(200)
      .json({ message: "Message send successfully.", message: newMessage });
  } catch (err) {
    return res.json({ message: err.message });
  }
};

export const getUserMessages = async (req, res) => {
  const { id } = req.user;
  try {
    const messages = await Message.findAll({
      where: { sender_id: id },
      include: [{ model: User, as: "sender" }],
    });
    if (messages.length < 1)
      return res.status(404).json({ message: "Messages not found" });

    return res.status(200).json({ message: "Messages List: ", messages });
  } catch (err) {
    return res.json({ message: err.message });
  }
};

export const getRoomMessages = async (req, res) => {
  const { id } = req.user;
  const { receiverId } = req.params;
  try {
    let a = id.toString() + receiverId.toString();
    let b = receiverId.toString() + id.toString();

    const messages = await Room_Chat.findAll({
      where: { room_id: ([Op.or] = [b, a]) },
      include: [
        //   { model: User, as: "sender" },
        //   { model: User, as: "receiver" },
        { model: Message },
      ],
      order: [[Sequelize.literal("createdAt"), "ASC"]],
    });

    if (messages.length < 1)
      return res.status(404).json({ message: "No messages found" });

    return res.status(200).json({ message: "Messages List: ", messages });
  } catch (err) {
    return res.json({ message: err.message });
  }
};

//////////////////////////////////////////////////////

// Group Chat
export const sendGroupMessage = async (req, res) => {
  const { id } = req.user;
  const { groupId } = req.params;
  const { message } = req.body;
  try {
    if (!message)
      return res.status(400).json({ message: "message field is empty" });

    const group = await Group.findOne({
      where: { id: groupId },
    });
    if (!group) return res.status(404).json({ message: "Group not found" });

    const newMessage = await Message.create({
      sender_id: id,
      group_id: groupId,
      message,
      img_url: req.file ? req.file.filename : "default.png",
      Room_Group: "Group",
    });

    await Group_Chat.create({
      sender_id: id,
      group_id: groupId,
      message_id: newMessage.id,
    });

    let msg = { message, newMessage };
    req.io.emit("group_chat", msg);

    return res
      .status(200)
      .json({ message: "Message send successfully.", message: newMessage });
  } catch (err) {
    return res.json({ message: err.message });
  }
};

export const getGroupMessages = async (req, res) => {
  const { groupId } = req.params;
  try {
    const messages = await Group_Chat.findAll({
      where: { group_id: groupId },
      include: [{ model: User }, { model: Group }, { model: Message }],
    });
    if (messages.length < 1)
      return res.status(404).json({ message: "No messages found" });

    return res.status(200).json({ message: "Messages List: ", messages });
  } catch (err) {
    return res.json({ message: err.message });
  }
};

//////////////////////////////
export const deleteMessage = async (req, res) => {
  const { id } = req.user;
  const { messageId } = req.params;
  try {
    const message = await Message.findOne({
      where: { id: messageId, sender_id: id },
    });
    if (!message)
      return res
        .status(404)
        .json({ message: "Unauthorized to do this operation" });

    if (message.img_url !== "default.png") {
      if (fs.existsSync("uploads/message/" + message.img_url))
        fs.unlinkSync("uploads/message/" + message.img_url);
    }

    await Message.destroy({ where: { id: message.id } });

    return res.status(200).json({ message: "Message deleted successfully" });
  } catch (err) {
    return res.json({ message: err.message });
  }
};

export const searchMessage = async (req, res) => {
  const { search } = req.query;
  const { id } = req.user;
  let filters = {};
  try {
    if (search)
      filters = {
        message: {
          [Op.like]: `%${search}%`,
        },
        sender_id: id,
      };

    const data = await Message.findAll({
      where: filters,
    });

    return res.status(200).json(data);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};
