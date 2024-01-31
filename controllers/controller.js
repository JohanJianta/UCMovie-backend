import { hash, compare, genSalt } from "bcrypt";
import { maxAge, createToken, verifyToken } from "../middleware/jwtServices.js";
import { generateRandomColor } from "../utils/colorGenerator.js";
import sequelize from "../database.js";
import User from "../models/User.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";

export async function authentication(req, res) {
  try {
    const userId = await verifyToken(req);
    res.status(200).json({ userId, message: "Token is valid" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
}

export async function register(req, res) {
  const { email, password, username } = req.body;

  try {
    const salt = await genSalt();
    const hashPass = await hash(password, salt);

    const color = generateRandomColor(username);

    const user = await User.create({
      email,
      password: hashPass,
      username,
      color,
    });
    const token = createToken(user.id);

    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ userId: user.id });
  } catch (error) {
    if (error.errors && error.errors.length > 0) {
      res
        .status(400)
        .json({ path: error.errors[0].path, message: error.errors[0].message });
    } else {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export async function login(req, res) {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email: email } });

    if (user) {
      const valid = await compare(password, user.password);
      if (valid) {
        const token = createToken(user.id);
        res.cookie("jwt", token, {
          httpOnly: true,
          sameSite: "lax",
          maxAge: maxAge * 1000,
        });

        return res.status(200).json({ userId: user.id });
      }
    }

    res.status(400).json({ message: "Incorrent email or password" });
  } catch (error) {
    if (error.errors && error.errors.length > 0) {
      res.status(400).json({ message: error });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export async function logout(req, res) {
  try {
    const userId = await verifyToken(req);

    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error("null");
    }

    res.clearCookie("jwt");

    res.status(200).json({ message: "Logged out success" });
  } catch (error) {
    if (error.message === "null") {
      res.status(400).json({ message: "User not found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export async function getUser(req, res) {
  try {
    const userId = await verifyToken(req);

    const user = await User.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("null");
    }

    res.status(200).json({ username: user.username });
  } catch (error) {
    if (error.message === "null") {
      res.status(400).json({ message: "User not found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export async function getAllPost(req, res) {
  try {
    const offset = parseInt(req.query.offset, 10) || 0;
    const limit = parseInt(req.query.limit, 10) || 5;

    const postsData = await Post.findAndCountAll({
      limit: limit,
      order: [["updatedAt", "DESC"]],
      offset: offset,
      include: { model: User, attributes: ["username", "color"] },
    });

    const posts = postsData.rows;

    if (!posts) {
      throw new Error("null");
    }

    const postIds = posts.map((post) => post.id);

    const comments = await Comment.findAll({
      attributes: [
        "PostId",
        [sequelize.fn("COUNT", sequelize.col("id")), "commentCount"],
      ],
      where: { PostId: postIds },
      group: ["PostId"],
    });

    // Map the comments to the corresponding posts
    posts.forEach((post) => {
      const matchingComment = comments.find(
        (comment) => comment.PostId === post.id
      );
      post.setDataValue(
        "commentCount",
        matchingComment ? matchingComment.get("commentCount") : 0
      );
    });

    res.status(200).json(postsData);
  } catch (error) {
    console.log(error);
    if (error.message === "null") {
      res.status(400).json({ message: "Post not found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export async function getPost(req, res) {
  try {
    const post = await Post.findOne({
      where: { id: req.params.id },
      include: { model: User, attributes: ["username", "color"] },
    });

    if (!post) {
      throw new Error("null");
    }

    res.status(200).json(post);
  } catch (error) {
    if (error.message === "null") {
      res.status(400).json({ message: "Post not found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export async function getAllPostComment(req, res) {
  try {
    const postComment = await Comment.findAll({
      where: {
        PostId: req.params.id,
      },
      include: { model: User, attributes: ["username", "color"] },
    });

    if (!postComment) {
      throw new Error("null");
    }

    res.status(200).json(postComment);
  } catch (error) {
    if (error.message === "null") {
      res.status(400).json({ message: "Post comment not found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export async function getUserPost(req, res) {
  try {
    const userId = await verifyToken(req);

    const userPost = await Post.findAll({
      where: {
        UserId: userId,
      },
    });

    if (!userPost) {
      throw new Error("null");
    }

    const postIds = userPost.map((post) => post.id);

    const comments = await Comment.findAll({
      attributes: [
        "PostId",
        [sequelize.fn("COUNT", sequelize.col("id")), "commentCount"],
      ],
      where: { PostId: postIds },
      group: ["PostId"],
    });

    // Map the comments to the corresponding posts
    userPost.forEach((post) => {
      const matchingComment = comments.find(
        (comment) => comment.PostId === post.id
      );
      post.setDataValue(
        "commentCount",
        matchingComment ? matchingComment.get("commentCount") : 0
      );
    });

    res.status(200).json(userPost);
  } catch (error) {
    if (error.message === "null") {
      res.status(400).json({ message: "User Post not found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export async function getMediaPost(req, res) {
  try {
    console.log(req.params.mediaId);
    const mediaPost = await Post.findAll({
      where: {
        mediaId: req.params.mediaId,
      },
      include: { model: User, attributes: ["username", "color"] },
    });

    console.log(mediaPost);

    if (!mediaPost) {
      throw new Error("null");
    }

    const postIds = mediaPost.map((post) => post.id);

    const comments = await Comment.findAll({
      attributes: [
        "PostId",
        [sequelize.fn("COUNT", sequelize.col("id")), "commentCount"],
      ],
      where: { PostId: postIds },
      group: ["PostId"],
    });

    // Map the comments to the corresponding posts
    mediaPost.forEach((post) => {
      const matchingComment = comments.find(
        (comment) => comment.PostId === post.id
      );
      post.setDataValue(
        "commentCount",
        matchingComment ? matchingComment.get("commentCount") : 0
      );
    });

    res.status(200).json(mediaPost);
  } catch (error) {
    if (error.message === "null") {
      res.status(400).json({ message: "Media Post not found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export async function addPost(req, res) {
  const { title, desc, mediaId, mediaType } = req.body;

  try {
    const userId = await verifyToken(req);

    // Tambah pengecekan apakah userId ada di database

    const post = await Post.create({
      title,
      desc,
      mediaId,
      mediaType,
      UserId: userId,
    });

    res.status(200).json({ postId: post.id });
  } catch (error) {
    if (
      (error.errors && error.errors[0].path === "UserId") ||
      error.table === "users" ||
      error.message === "Token is not found" ||
      error.message === "Token is not valid"
    ) {
      res
        .status(400)
        .json({ message: "Cannot create post with invalid user id" });
    } else if (error.errors && error.errors.length > 0) {
      res.status(400).json({ message: error.errors[0].message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export async function getUserComment(req, res) {
  try {
    const userId = await verifyToken(req);

    const userComment = await Comment.findAll({
      where: {
        UserId: userId,
      },
      include: { model: Post, attributes: ["title"] },
    });

    if (!userComment) {
      throw new Error("null");
    }

    res.status(200).json(userComment);
  } catch (error) {
    if (error.message === "null") {
      res.status(400).json({ message: "User not found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export async function addComment(req, res) {
  const { comment, postId } = req.body;

  try {
    const userId = await verifyToken(req);

    // Tambah pengecekan apakah userId ada di database

    const postComment = await Comment.create({
      comment,
      UserId: userId,
      PostId: postId,
    });

    res.status(200).json({ commentId: postComment.id });
  } catch (error) {
    if (error.errors && error.errors[0].path === "comment") {
      res.status(400).json({ message: "Comment cannot be empty" });
    } else if (
      (error.errors && error.errors[0].path === "UserId") ||
      error.table === "users" ||
      error.message === "Token is not found" ||
      error.message === "Token is not valid"
    ) {
      res.status(400).json({
        field: "user",
        message: "Cannot create comment with invalid user id",
      });
    } else if (
      (error.errors && error.errors[0].path === "PostId") ||
      error.table === "posts"
    ) {
      res
        .status(400)
        .json({ message: "Cannot create comment with invalid post id" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
