const {
  readAllArticles,
  readArticleById,
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
  readAllArticles()
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
};
