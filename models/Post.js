import { DataTypes } from "sequelize";
import sequelize from "../database.js";
import User from "./User.js";

const Post = sequelize.define("Post", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Title must not be empty",
      },
      len: {
        args: [1, 50],
        msg: "Maximum title length is 50 characters",
      },
    },
  },
  desc: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mediaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  mediaType: {
    type: DataTypes.ENUM(["movie", "tv"]),
    allowNull: false,
  },
});

User.hasMany(Post, { foreignKey: { allowNull: false } });
Post.belongsTo(User, { foreignKey: { allowNull: false } });

export default Post;
