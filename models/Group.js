import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const Group = sequelize.define(
  "groups",
  {
    admin_id: {
      type: DataTypes.INTEGER,
      onDelete: "CASCADE",
      references: {
        model: "users",
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.STRING,
    },
    members_number: {
      type: DataTypes.INTEGER,
    },
  },
  { timestamps: true }
);

export default Group;
