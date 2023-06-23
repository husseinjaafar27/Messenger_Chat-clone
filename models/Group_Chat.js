import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const Group_Chat = sequelize.define(
  "group_chats",
  {
    sender_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    group_id: {
      type: DataTypes.INTEGER,
      onDelete: "CASCADE",
      references: {
        model: "groups",
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
  },
  { timestamps: true }
);

export default Group_Chat;
