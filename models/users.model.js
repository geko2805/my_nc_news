const db = require("../db/connection");

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
