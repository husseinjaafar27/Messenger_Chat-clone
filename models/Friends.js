import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const Friends = sequelize.define(
  "friends",
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
    status: {
      type: DataTypes.ENUM(["pending", "accepted"]),
    },
  },
  { timestamps: true }
);

export default Friends;
