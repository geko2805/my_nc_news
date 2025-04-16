const {
  readAllArticles,
  readArticleById,
  updateArticle,
  insertArticle,
  removeArticleById,
} = require("../models/articles.model");

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  readArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getAllArticles = (req, res, next) => {
  const {
    sort_by = "created_at",
    order = "DESC",
    topic, //for topic pages
    page = 1,
    limit = 12,
    hide_negative = "false", // filter to hide articles with negative votes
    author, // filter by author
    date_range, // filter by publish date - "all", "week", "month", "year"
    selected_topics, // filter array of topics for multiple topics (e.g. ?selected_topics=coding,football)
    count_only = "false", //param used to return only the count not full results when = true
    search, //user input to search against the ts_vector column in database
  } = req.query;

  readAllArticles(
    sort_by,
    order,
    topic,
    page,
    limit,
    hide_negative === "true", // convert to boolean
    author,
    date_range,
    selected_topics ? selected_topics.split(",") : null, // convert csv string to array
    count_only === "true", // convert to boolean
    search
  )
    .then((result) => {
      res.status(200).send(result); // Either { articles, total_count } or { total_count }
    })
    .catch(next);
};

exports.patchArticle = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;

  updateArticle(article_id, inc_votes)
    .then((article) => {
      res.status(202).send({ article });
    })
    .catch(next);
};

exports.postArticle = (req, res, next) => {
  const { author, title, body, topic, article_img_url } = req.body;
  const promises = [insertArticle(author, title, body, topic, article_img_url)];

  Promise.all(promises)
    .then(([article]) => {
      res.status(201).send({ article });
    })
    .catch(next);
};

exports.deleteArticleById = (req, res, next) => {
  const { article_id } = req.params;
  removeArticleById(article_id)
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => {
      next(err);
    });
};
