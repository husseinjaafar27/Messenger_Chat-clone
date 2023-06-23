import express from "express";
import multer from "multer";

import {
  addImg,
  deleteUser,
  editUser,
  getUser,
  getUsers,
  searchUser,
} from "../controllers/userController.js";
import userAuth from "../middlewares/userAuth.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/user");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "+" + file.originalname);
  },
});

const upload = multer({ storage: storage });
const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUser);
router.delete("/", userAuth, deleteUser);
router.patch("/edit", userAuth, editUser);
router.patch("/addImg", userAuth, upload.single("img_url"), addImg);
router.get("/search/filter", searchUser);

export default router;
