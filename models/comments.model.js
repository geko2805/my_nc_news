const db = require("../db/connection");
const { checkExists } = require("../utils/utils");

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

exports.insertComment = async (article_id, username, body) => {
  await checkExists("users", "username", username);
  await checkExists("articles", "article_id", article_id);

  if (!body) {
    return Promise.reject({
      status: 400,
      msg: "Bad request - No Comment body",
    });
  } else {
    return db
      .query(
        `INSERT INTO comments (article_id, body, author)
    VALUES ($1, $2, $3) RETURNING *;`,
        [article_id, body, username]
      )
      .then(({ rows }) => {
        return rows[0];
      });
  }
};
