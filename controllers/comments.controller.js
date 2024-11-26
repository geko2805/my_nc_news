const { readArticleById } = require("../models/articles.model");
const { readCommentsByArticleId } = require("../models/comments.model");

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const promises = [readCommentsByArticleId(article_id)];
  if (article_id) {
    //check the article_id exists
    promises.push(readArticleById(article_id));
  }

  Promise.all(promises)
    .then(([comments]) => {
      if (comments.length === 0) {
        res.status(200).send({ msg: "No comments for this article" });
      } else {
        res.status(200).send({ comments });
      }
    })
    .catch(next);
};
