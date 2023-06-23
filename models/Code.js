import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const Code = sequelize.define("codes", {
  code: {
    type: DataTypes.STRING,
  },
  user_id: {
    type: DataTypes.INTEGER,
    onDelete: "CASCADE",
    references: {
      model: "users",
      key: "id",
    },
  },
  type: {
    type: DataTypes.ENUM(["Reset Password", "Verify Account"]),
  },
});

export default Code;
