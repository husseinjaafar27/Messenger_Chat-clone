import express from "express";

import userAuth from "../middlewares/userAuth.js";
import {
  acceptRejectRequest,
  createGroup,
  deleteGroup,
  editGroup,
  getGroupMembers,
  numberOfMember,
  removeMemberByadmin,
  sendGroupRequest,
} from "../controllers/groupController.js";

const router = express.Router();

router.post("/", userAuth, createGroup);
router.get("/:groupId", getGroupMembers);
router.get("/number/:id", numberOfMember);
router.delete("/:groupId", userAuth, deleteGroup);
router.delete("/remove/:groupId/:memberId", userAuth, removeMemberByadmin);
router.post("/request/:groupId", userAuth, sendGroupRequest);
router.patch("/:groupId/:member", userAuth, acceptRejectRequest);
router.patch("/edit/:groupId", userAuth, editGroup);

export default router;
