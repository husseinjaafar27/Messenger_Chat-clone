import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const Message = sequelize.define(
  "messages",
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
    group_id: {
      type: DataTypes.INTEGER,
      onDelete: "CASCADE",
      references: {
        model: "groups",
        key: "id",
      },
    },
    message: {
      type: DataTypes.TEXT,
    },
    img_url: {
      type: DataTypes.STRING,
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    Room_Group: {
      type: DataTypes.ENUM(["Room", "Group"]),
    },
  },
  { timestamps: true }
);

export default Message;
