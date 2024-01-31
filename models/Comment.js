import { DataTypes } from "sequelize";
import sequelize from "../database.js";
import User from "./User.js";
import Post from "./Post.js";

const Comment = sequelize.define("Comment", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  comment: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

User.hasMany(Comment, { foreignKey: { allowNull: false } });
Comment.belongsTo(User, { foreignKey: { allowNull: false } });

Post.hasMany(Comment, { foreignKey: { allowNull: false } });
Comment.belongsTo(Post, { foreignKey: { allowNull: false } });

export default Comment;
