import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { promisify } from "util";

const userAuth = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "You are not logged in" });
    }

    let decoded;
    try {
      decoded = await promisify(jwt.verify)(token, process.env.SECRET_KEY);
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json("Invalid token");
      } else if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json("Your session token has expired !! Login again");
      }
    }

    const currentUser = await User.findByPk(decoded.id);
    if (!currentUser) {
      return res
        .status(401)
        .json({ message: "The token owner no longer exist" });
    }

    if (token.exp < new Date())
      return res.status(401).json({
        message: "Not Authenticated",
      });

    req.user = currentUser;
    next();
  } catch (err) {
    console.log(err);
  }
};

export default userAuth;
