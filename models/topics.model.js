const db = require("../db/connection");
const { checkDoesntExist } = require("../utils/utils");

exports.readAllTopics = () => {
  //console.log("hello from the model");
  return db.query(`SELECT * FROM topics;`).then((result) => {
    return result.rows;
  });
};

exports.insertTopic = async (slug, description) => {
  if (!slug) {
    return Promise.reject({
      status: 400,
      msg: "Bad request - No slug",
    });
  } else if (!description) {
    return Promise.reject({
      status: 400,
      msg: "Bad request - No description",
    });
  } else {
    await checkDoesntExist("topics", "slug", slug);
    return db
      .query(
        `INSERT INTO topics (slug, description)
    VALUES ($1, $2) RETURNING *;`,
        [slug, description]
      )
      .then(({ rows }) => {
        return rows[0];
      });
  }
};
