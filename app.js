const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());

const getApi = require("./controllers/api.controller");
const { getTopics, postTopic } = require("./controllers/topics.controller");
const {
  getArticleById,
  getAllArticles,
  patchArticle,
  postArticle,
  deleteArticleById,
} = require("./controllers/articles.controller");
const {
  getCommentsByArticleId,
  postComment,
  deleteCommentById,
  patchComment,
} = require("./controllers/comments.controller");

const {
  psqlErrorHandler,
  customErrorHandler,
  serverErrorHandler,
} = require("./error-handlers");
const {
  getUsers,
  getUserByUsername,
  patchUser,
  postUser,
} = require("./controllers/users.controller");

app.use(express.json());

app.get("/api", getApi);
app.get("/api/topics", getTopics);
app.post("/api/topics", postTopic);

app.get("/api/articles", getAllArticles);
app.get("/api/articles/:article_id", getArticleById);
app.patch("/api/articles/:article_id", patchArticle);
app.delete("/api/articles/:article_id", deleteArticleById);
app.post("/api/articles", postArticle);

app.get("/api/users", getUsers);
app.get("/api/users/:username", getUserByUsername);
app.patch("/api/users/:username", patchUser);
app.post("/api/users", postUser);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);
app.post("/api/articles/:article_id/comments", postComment);
app.delete("/api/comments/:comment_id", deleteCommentById);
app.patch("/api/comments/:comment_id", patchComment);

app.all("/*", (req, res) => {
  res.status(404).send({ msg: "Route not found" });
});

app.use(psqlErrorHandler);
app.use(customErrorHandler);
app.use(serverErrorHandler);

module.exports = app;
