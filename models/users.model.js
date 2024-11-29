const db = require("../db/connection");

exports.readAllUsers = () => {
  return db.query(`SELECT * FROM users;`).then((result) => {
    return result.rows;
  });
};
