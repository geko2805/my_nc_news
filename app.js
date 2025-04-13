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
} = require("./controllers/users.controller");

app.use(express.json());

app.get("/api", getApi);
app.get("/api/topics", getTopics);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles", getAllArticles);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);
app.get("/api/users", getUsers);
app.get("/api/users/:username", getUserByUsername);

app.post("/api/articles/:article_id/comments", postComment);
app.post("/api/articles", postArticle);
app.post("/api/topics", postTopic);

app.patch("/api/articles/:article_id", patchArticle);

app.delete("/api/comments/:comment_id", deleteCommentById);
app.delete("/api/articles/:article_id", deleteArticleById);

app.patch("/api/comments/:comment_id", patchComment);

app.all("/*", (req, res) => {
  res.status(404).send({ msg: "Route not found" });
});

app.use(psqlErrorHandler);
app.use(customErrorHandler);
app.use(serverErrorHandler);

module.exports = app;
