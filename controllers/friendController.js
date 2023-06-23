import User from "../models/User.js";
import Friends from "../models/Friends.js";
import { Op, Sequelize } from "sequelize";

export const addFriend = async (req, res) => {
  const { id } = req.user;
  const { receiverId } = req.params;
  try {
    const receiver = await User.findOne({
      where: { id: receiverId, is_deleted: false },
    });
    if (!receiver) return res.status(404).json({ message: "User not found" });
    const checkFriend = await Friends.findOne({
      where: {
        sender_id: { [Op.or]: [receiverId, id] },
        receiver_id: { [Op.or]: [id, receiverId] },
      },
    });

    if (!checkFriend) {
      const newFriend = await Friends.create({
        sender_id: id,
        receiver_id: receiverId,
        status: "pending",
      });
      return res.status(200).json({ newFriend });
    } else if (checkFriend.status == "pending") {
      return res.status(400).json({ message: "already sent a request " });
    } else if (checkFriend.status == "accepted") {
      return res.status(400).json({ message: "You are already Friends" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const acceptFriend = async (req, res) => {
  const { id } = req.user;
  const { receiverId } = req.params;
  try {
    const receiver = await User.findOne({
      where: { id: receiverId, is_deleted: false },
    });
    if (!receiver) return res.status(404).json({ message: "User not found" });
    const checkFriend = await Friends.findOne({
      where: {
        sender_id: receiverId,
        receiver_id: id,
      },
    });
    if (checkFriend) {
      if (checkFriend.status == "accepted") {
        return res.status(400).json({ message: "You are already Friends" });
      } else if (checkFriend.status == "pending") {
        checkFriend.status = "accepted";
        await checkFriend.save();
        return res.status(200).json({ message: "Friend added successfully" });
      }
    } else {
      return res.status(200).json({ message: "Friend request not exist" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const rejectFriend = async (req, res) => {
  const { id } = req.user;
  const { receiverId } = req.params;
  try {
    const receiver = await User.findOne({
      where: { id: receiverId, is_deleted: false },
    });
    if (!receiver) return res.status(404).json({ message: "User not found" });
    const checkFriend = await Friends.findOne({
      where: {
        sender_id: receiverId,
        receiver_id: id,
      },
    });

    if (checkFriend) {
      if (checkFriend.status == "accepted") {
        return res.status(400).json({ message: "You are already Friends" });
      } else if (checkFriend.status == "pending") {
        await Friends.destroy({ where: { id: checkFriend.id } });
        return res.status(200).json({
          message: "Friend request deleted successfully",
        });
      }
    } else {
      return res.status(200).json({ message: "Friend request not exist" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const removeFriend = async (req, res) => {
  const { id } = req.user;
  const { receiverId } = req.params;
  try {
    const receiver = await User.findOne({
      where: { id: receiverId, is_deleted: false },
    });
    if (!receiver) return res.status(404).json({ message: "User not found" });
    const checkFriend = await Friends.findOne({
      where: {
        sender_id: { [Op.or]: [receiverId, id] },
        receiver_id: { [Op.or]: [id, receiverId] },
      },
    });

    if (checkFriend) {
      await Friends.destroy({ where: { id: checkFriend.id } });
      return res.status(200).json({
        message: "Friend removed successfully",
      });
    } else {
      return res.status(200).json({ message: "Friend request not exist" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getMyFriends = async (req, res) => {
  const { id } = req.user;
  try {
    const friends = await Friends.findAll({
      where: {
        [Op.or]: [{ sender_id: id }, { receiver_id: id }],
        status: "accepted",
      },
      order: [[Sequelize.literal("createdAt"), "DESC"]],
    });

    if (friends.length < 1)
      return res.status(404).json({ message: "No friends found" });
    return res.status(200).json({ message: "Friends List :", friends });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getMyFriendsRequest = async (req, res) => {
  const { id } = req.user;
  try {
    const requests = await Friends.findAll({
      where: {
        receiver_id: id,
        status: "pending",
      },
      order: [[Sequelize.literal("createdAt"), "DESC"]],
    });

    if (requests.length < 1)
      return res.status(404).json({ message: "No request found" });
    return res.status(200).json({ message: "Request List :", requests });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
