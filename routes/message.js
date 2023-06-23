import express from "express";
import multer from "multer";

import {
  deleteMessage,
  getRoomMessages,
  getUserMessages,
  searchMessage,
  sendGroupMessage,
  sendRoomMessage,
} from "../controllers/messageController.js";
import userAuth from "../middlewares/userAuth.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/message");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "+" + file.originalname);
  },
});

const upload = multer({ storage: storage });
const router = express.Router();

router.post(
  "/room/:receiverId",
  userAuth,
  upload.single("img_url"),
  sendRoomMessage
);
router.post(
  "/group/:groupId",
  userAuth,
  upload.single("img_url"),
  sendGroupMessage
);
router.get("/", userAuth, getUserMessages);
router.get("/room/:receiverId", userAuth, getRoomMessages);
router.delete("/:messageId", userAuth, deleteMessage);
router.get("/search", userAuth, searchMessage);

export default router;
