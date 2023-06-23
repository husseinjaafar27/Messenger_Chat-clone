import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const User = sequelize.define(
  "users",
  {
    first_name: {
      type: DataTypes.STRING,
    },
    last_name: {
      type: DataTypes.STRING,
    },
    username: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
    },
    img_url: {
      type: DataTypes.STRING,
    },
    year_of_birthday: {
      type: DataTypes.DATEONLY,
    },
    gender: {
      type: DataTypes.ENUM(["male", "female"]),
    },
    phone: {
      type: DataTypes.STRING,
    },
    country: {
      type: DataTypes.STRING,
    },
    active_status: {
      type: DataTypes.ENUM(["Online", "Offline"]),
      defaultValue: "Offline",
    },
    last_connection: {
      type: DataTypes.DATE,
    },
    last_seen: {
      type: DataTypes.DATE,
    },
    user_time_zone: {
      type: DataTypes.STRING,
    },
    is_logout: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    socket_id: {
      type: DataTypes.STRING,
    },
  },
  { timestamps: true }
);

export default User;
