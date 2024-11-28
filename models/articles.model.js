const db = require("../db/connection");

exports.readArticleById = (article_id) => {
  let queryString = "SELECT * FROM articles";
  const queryVals = [];
  if (article_id) {
    queryString += ` WHERE article_id = $1;`;
    queryVals.push(article_id);
  }

  return db.query(queryString, queryVals).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "ID not found" });
    }
    return rows[0];
  });
};
exports.readAllArticles = () => {
  return db
    .query(
      `SELECT articles.author, 
      articles.title, 
      articles.article_id, 
      articles.created_at, 
      articles.topic, 
      articles.votes, 
      articles.article_img_url, 
      CAST(COUNT(comments.comment_id) AS INTEGER) AS comment_count
        FROM articles 
        LEFT OUTER JOIN comments ON articles.article_id = comments.article_id 
        GROUP BY articles.author, articles.title, articles.article_id, articles.created_at, articles.topic, articles.votes, articles.article_img_url
        ORDER BY articles.created_at DESC;`
    )
    .then(({ rows }) => {
      return rows;
    });
};

exports.updateArticle = (article_id, inc_votes) => {
  return db
    .query(
      `UPDATE articles
    SET votes= votes + $1
    WHERE article_id =$2
    RETURNING *;`,
      [inc_votes, article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "ID not found" });
      }
      return rows[0];
    });
};
