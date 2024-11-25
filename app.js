const express = require("express");
const app = express();

const getApi = require("./controllers/api.controller");
const { getTopics } = require("./controllers/topics.controller");
const { getArticleById } = require("./controllers/articles.controller");

const {
  psqlErrorHandler,
  customErrorHandler,
  serverErrorHandler,
} = require("./error-handlers");

app.use(express.json());

app.get("/api", getApi);
app.get("/api/topics", getTopics);
app.get("/api/articles/:article_id", getArticleById);

app.all("/*", (req, res) => {
  res.status(404).send({ msg: "Route not found" });
});

app.use(psqlErrorHandler);
app.use(customErrorHandler);
app.use(serverErrorHandler);

module.exports = app;
