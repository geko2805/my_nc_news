const { readArticleById } = require("../models/articles.model");
const {
  readCommentsByArticleId,
  insertComment,
  removeCommentById,
} = require("../models/comments.model");
const { checkExists } = require("../utils/utils");

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

exports.postComment = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;
  const promises = [insertComment(article_id, username, body)];

  Promise.all(promises)
    .then(([comment]) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.deleteCommentById = (req, res, next) => {
  const { comment_id } = req.params;
  removeCommentById(comment_id)
    .then((deletedComment) => {
      if (deletedComment.rowCount === 0) {
        return Promise.reject({
          status: 404,
          msg: "comment does not exist",
        });
      }
      res.status(204).send();
    })
    .catch(next);
};
