import express from "express";
import {
  activateUser,
  changePassword,
  forgetPassword,
  logOut,
  login,
  registerUser,
  validateResetCode,
} from "../controllers/authController.js";
import userAuth from "../middlewares/userAuth.js";

const router = express.Router();

router.post("/register", registerUser);
router.patch("/activate", activateUser);
router.post("/login", login);
router.patch("/logout", userAuth, logOut);
router.post("/forgetPassword", forgetPassword);
router.post("/validatePassword", validateResetCode);
router.patch("/changePassword", changePassword);

export default router;
