import express from "express";

import userAuth from "../middlewares/userAuth.js";
import {
  acceptFriend,
  addFriend,
  getMyFriends,
  getMyFriendsRequest,
  rejectFriend,
  removeFriend,
} from "../controllers/friendController.js";

const router = express.Router();

router.post("/add/:receiverId", userAuth, addFriend);
router.patch("/accept/:receiverId", userAuth, acceptFriend);
router.delete("/reject/:receiverId", userAuth, rejectFriend);
router.delete("/remove/:receiverId", userAuth, removeFriend);
router.get("/myFriends/", userAuth, getMyFriends);
router.get("/request/", userAuth, getMyFriendsRequest);

export default router;
