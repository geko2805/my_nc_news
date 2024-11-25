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
