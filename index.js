import express, { urlencoded, json } from "express";
import { Server } from "socket.io";
import cors from "cors";
import http from "http";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import User from "./models/User.js";
import sequelize from "./database.js";

import "./associations.js";

import authRoute from "./routes/auth.js";
import userRoute from "./routes/user.js";
import messageRoute from "./routes/message.js";
import groupRoute from "./routes/group.js";
import friendRoute from "./routes/friends.js";

const app = express();
app.use(urlencoded({ extended: true }));
app.use(express.static("uploads"));
app.use(json());
app.use(cors());

const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connect", async function (socket) {
  let token = socket.handshake.headers.authorization;

  console.log("User connected", socket.id);
  token = token.split(" ")[1];
  const decodeToken = jwt.verify(token, process.env.SECRET_KEY);
  const user = decodeToken;

  socket.broadcast.emit("userConnection", { userId: user.id });
  let timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  console.log(timeZone);
  if (user) {
    await User.update(
      {
        status: "Online",
        last_connection: new Date(),
        user_time_zone: timeZone,
        socket_id: socket.id,
      },
      { where: { id: user.id } }
    );
  } else {
    return;
  }

  socket.on("connected", async function () {
    io.emit("connected", {});
  });

  socket.on("disconnect", async () => {
    console.log(`user ${socket.id} disconnected`);
    if (user) {
      await User.update(
        {
          status: "Offline",
          last_seen: new Date(),
        },
        { where: { id: user.id } }
      );
      socket.broadcast.emit("userLeft", { userId: user.id });
    } else {
      return;
    }
  });
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use("/", authRoute);
app.use("/user", userRoute);
app.use("/message", messageRoute);
app.use("/group", groupRoute);
app.use("/friend", friendRoute);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
