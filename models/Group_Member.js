import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const Group_Member = sequelize.define(
  "group_members",
  {
    group_id: {
      type: DataTypes.INTEGER,
      onDelete: "CASCADE",
      references: {
        model: "groups",
        key: "id",
      },
    },
    member_id: {
      type: DataTypes.INTEGER,
      onDelete: "CASCADE",
      references: {
        model: "users",
        key: "id",
      },
    },
    admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM(["pending", "accepted", "rejected", "Main Admin"]),
      defaultValue: "pending",
    },
    accepted_by: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  { timestamps: true }
);

export default Group_Member;
