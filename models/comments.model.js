const db = require("../db/connection");

exports.readCommentsByArticleId = (article_id) => {
  let queryString = "SELECT * FROM comments";
  const queryVals = [];
  if (article_id) {
    queryString += ` WHERE article_id = $1 ORDER BY comments.created_at DESC;`;
    queryVals.push(article_id);
  }
  return db.query(queryString, queryVals).then(({ rows }) => {
    return rows;
  });
};
