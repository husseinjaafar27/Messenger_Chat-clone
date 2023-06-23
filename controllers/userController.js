import { Op } from "sequelize";
import User from "../models/User.js";
import fs from "fs";

export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        is_verified: true,
        is_deleted: false,
      },
    });
    if (users.length < 1)
      return res.status(404).json({ message: "Users not found" });

    return res.status(200).json({ message: "All users list: ", data: users });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({
      where: {
        is_verified: true,
        is_deleted: false,
        id: id,
      },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    console.log(user);
    // const {password , others} = user

    return res.status(200).json({ message: "User found: ", data: user });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const editUser = async (req, res) => {
  const { first_name, last_name, gender, year_of_birthday, phone, country } =
    req.body;
  const { id } = req.user;
  try {
    const user = await User.findByPk(id);
    if (first_name || last_name) {
      user.first_name = first_name ? first_name : user.first_name;
      user.last_name = last_name ? last_name : user.last_name;
      let tempUsername = user.first_name + user.last_name;
      let newUsername = await validateUsername(tempUsername);
      user.username = newUsername;
    }
    user.year_of_birthday = year_of_birthday
      ? year_of_birthday
      : user.year_of_birthday;
    user.gender = gender ? gender : user.gender;
    user.phone = phone ? phone : user.phone;
    user.country = country ? country : user.country;

    const updatedUser = await user.save();

    return res.status(200).json({
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.user;
  try {
    const user = await User.findOne({ where: { id: id } });

    const img_url = user.img_url;

    if (img_url !== "default.png") {
      try {
        if (fs.existsSync("uploads/user/" + img_url))
          fs.unlinkSync("uploads/user/" + img_url);
      } catch (error) {
        console.log({ message: error.message });
      }
    }

    user.email += ` is deleted ${id}`;
    user.is_deleted = true;
    user.save();
    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const addImg = async (req, res) => {
  const { id } = req.user;
  try {
    if (req.file) {
      await User.update(
        { img_url: req.file ? req.file.filename : "default.png" },
        { where: { id: id } }
      );
    } else {
      return res.status(200).json({
        message: "No Image to add",
      });
    }
    return res.status(200).json({
      message: "Image added successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const searchUser = async (req, res) => {
  const { search } = req.query;
  let filter = {};
  try {
    if (search)
      filter = {
        username: {
          [Op.like]: `%${search}%`,
        },
      };

    const data = await User.findAll({
      where: filter,
    });

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
