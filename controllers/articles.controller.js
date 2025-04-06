const {
  readAllArticles,
  readArticleById,
  updateArticle,
  insertArticle,
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
  const { sort_by, order, topic } = req.query;
  readAllArticles(sort_by, order, topic)
    .then((articles) => {
      res.status(200).send({ articles });
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
  console.log("hello from controller");
  const { author, title, body, topic, article_img_url } = req.body;
  const promises = [insertArticle(author, title, body, topic, article_img_url)];

  Promise.all(promises)
    .then(([article]) => {
      res.status(201).send({ article });
    })
    .catch(next);
};
