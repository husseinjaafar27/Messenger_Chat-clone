import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const Room_Chat = sequelize.define(
  "room_chats",
  {
    sender_id: {
      type: DataTypes.INTEGER,
      onDelete: "CASCADE",
      references: {
        model: "users",
        key: "id",
      },
    },
    receiver_id: {
      type: DataTypes.INTEGER,
      onDelete: "CASCADE",
      references: {
        model: "users",
        key: "id",
      },
    },
    message_id: {
      type: DataTypes.INTEGER,
      onDelete: "CASCADE",
      references: {
        model: "messages",
        key: "id",
      },
    },
    room_id: {
      type: DataTypes.INTEGER,
    },
  },
  { timestamps: true }
);

export default Room_Chat;
