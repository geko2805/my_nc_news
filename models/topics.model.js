const db = require("../db/connection");

exports.readAllTopics = () => {
  console.log("hello from the model");
  return db.query(`SELECT * FROM topics;`).then((result) => {
    return result.rows;
  });
};
