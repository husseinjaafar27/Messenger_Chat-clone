import User from "../models/User.js";
import Code from "../models/Code.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { validateEmail, validateUsername } from "../helpers/validation.js";
import { sendMailActivate, sendMailPassword } from "../helpers/email.js";
import { generateCode } from "../helpers/generateCode.js";

const signToken = (id) => {
  const token = jwt.sign({ id }, process.env.SECRET_KEY, {
    expiresIn: process.env.expiresIn,
  });
  return token;
};

export const registerUser = async (req, res) => {
  const { first_name, last_name, username, email, password } = req.body;
  try {
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const checkEmail = await User.findOne({ where: { email: email } });
    if (checkEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "The email is not valid" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be greater than or equal to 6" });
    }

    let tempUsername = first_name + last_name;
    let newUsername = await validateUsername(tempUsername);

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      first_name,
      last_name,
      username: newUsername,
      email,
      password: hashedPassword,
    });

    const token = signToken(newUser.id);
    const code = generateCode(5);
    await new Code({
      code,
      user_id: newUser.id,
      type: "Verify Account",
    }).save();
    const name = first_name + " " + last_name;
    sendMailActivate(email, name, code);

    return res.status(200).json({
      message:
        "User created successfully! Your verified code is sent to your email address",
      data: {
        id: newUser.id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
      },
      token,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const activateUser = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return res.status(404).json({
        message: "invalid email address",
      });
    }
    if (user.is_verified == 1) {
      return res.status(400).json({
        message: "Your account is already verified",
      });
    }

    const Dbcode = await Code.findOne({ where: { user_id: user.id } });
    if (!Dbcode) {
      return res.status(404).json({ message: "Code not found" });
    }
    if (Dbcode.code !== code) {
      return res.status(400).json({
        message: "Verification code is wrong..",
      });
    }

    user.is_verified = true;
    await user.save();
    return res.status(200).json({ message: "Your account has been verified" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return res.status(400).json({ message: "Email is not exists" });
    }

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(400).json({ message: "Invalid credentials." });
    }
    if (user.is_verified == 0) {
      const code = generateCode(5);
      await Code.update(
        { code: code, type: "Verify Account" },
        { where: { user_id: user.id } }
      );

      const name = user.first_name + " " + user.last_name;
      sendMailActivate(user.email, name, code);
    }
    user.is_logout = false;
    user.save();
    const token = signToken(user.id);
    return res.status(200).json({
      message: user.is_verified
        ? "login successfully"
        : "Login successfully! Your verified code is sent to your email address",
      data: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const logOut = async (req, res) => {
  const { id } = req.user;
  try {
    const user = await User.findByPk(id);
    user.is_logout = true;
    user.save();
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return res.status(404).json({
        message: "invalid email address",
      });
    }

    const code = generateCode(5);
    await Code.update(
      { code: code, type: "Reset Password" },
      { where: { user_id: user.id } }
    );

    const name = user.first_name + " " + user.last_name;
    sendMailPassword(user.email, name, code);
    return res.status(200).json({
      message: "Email reset code has been sent to your email",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const validateResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return res.status(404).json({
        message: "Invalid email address",
      });
    }
    const Dbcode = await Code.findOne({ where: { user: user.id } });
    if (Dbcode.code !== code) {
      return res.status(400).json({
        message: "Verification code is wrong..",
      });
    }
    return res
      .status(200)
      .json({ message: "You can now change your password" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { email, password, passwordConfirm } = req.body;

    if (!email || !password || !passwordConfirm) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ where: { email: email } });
    if (password.length < 6) {
      return res
        .status(404)
        .json({ message: "Password must be greater than or equal to 6" });
    }
    if (password !== passwordConfirm) {
      return res
        .status(404)
        .json({ message: "Password and passwword confirm must be the same" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    await user.save();
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
