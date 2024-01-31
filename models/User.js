import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: { msg: "The username is taken" },
    validate: {
      len: {
        args: [3, 36],
        msg: "Username length must between 3 to 36 characters",
      },
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    isEmail: true,
    unique: { msg: "The email is already exist" },
    validate: {
      isEmail: { msg: "The email is not valid" },
      len: { args: [1, 255], msg: "Maximum email length is 255 characters" },
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default User;
