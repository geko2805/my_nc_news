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
//count(comment_id) AS comment_count
exports.readAllArticles = () => {
  return db
    .query(
      `SELECT articles.author, articles.title, articles.article_id, articles.created_at, articles.topic, articles.votes, articles.article_img_url, count(comments.comment_id) AS comment_count
        FROM articles 
        LEFT OUTER JOIN comments ON articles.article_id = comments.article_id 
        GROUP BY articles.author, articles.title, articles.article_id, articles.created_at, articles.topic, articles.votes, articles.article_img_url
        ORDER BY articles.created_at DESC;`
    )
    .then(({ rows }) => {
      //convert comment count values from string to Number
      for (let row of rows) {
        row.comment_count = Number(row.comment_count);
      }
      return rows;
    });
};
