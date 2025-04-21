const db = require("../db/connection");
const { checkDoesntExist } = require("../utils/utils");

exports.readAllUsers = () => {
  return db.query(`SELECT * FROM users;`).then((result) => {
    return result.rows;
  });
};

exports.readUserByUsername = (username) => {
  let queryString = `SELECT users.username, 
      users.avatar_url, 
      users.name
        FROM users
        WHERE users.username = $1`;
  const queryVals = [username];

  return db.query(queryString, queryVals).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "User not found" });
    }
    return rows[0];
  });
};

exports.updateUser = (username, avatar_url) => {
  return db
    .query(
      `UPDATE users
    SET avatar_url= $1
    WHERE username =$2
    RETURNING *;`,
      [avatar_url, username]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "User not found" });
      }
      return rows[0];
    });
};

exports.insertUser = async (name, username, avatar_url) => {
  if (!name) {
    return Promise.reject({
      status: 400,
      msg: "Bad request - No name",
    });
  } else if (!username) {
    return Promise.reject({
      status: 400,
      msg: "Bad request - No username",
    });
  } else {
    await checkDoesntExist("users", "username", username);
    return db
      .query(
        `INSERT INTO users (name, username, avatar_url)
    VALUES ($1, $2, $3) RETURNING *;`,
        [name, username, avatar_url]
      )
      .then(({ rows }) => {
        return rows[0];
      });
  }
};
