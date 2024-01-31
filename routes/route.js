import { Router } from "express";
import {
  authentication,
  register,
  login,
  addPost,
  addComment,
  getPost,
  getAllPost,
  getAllPostComment,
  getUser,
  getUserComment,
  logout,
  getUserPost,
  getMediaPost,
} from "../controllers/controller.js";

const route = Router();

route.get("/protected", authentication);

route.get("/user", getUser);
route.get("/user/post", getUserPost);
route.get("/user/comment", getUserComment);

route.post("/login", login);
route.post("/register", register);
route.get("/logout", logout);

route.get("/media/post/:mediaId", getMediaPost);

route.get("/post", getAllPost);
route.get("/post/:id", getPost);
route.get("/post/:id/comment", getAllPostComment);
route.post("/post", addPost);

route.post("/comment", addComment);

export default route;
