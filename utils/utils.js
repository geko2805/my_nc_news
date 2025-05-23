const db = require("../db/connection");
const format = require("pg-format");

exports.checkExists = async (table, column, value) => {
  const queryStr = format("SELECT * FROM %I WHERE %I = $1;", table, column);
  const dbOutput = await db.query(queryStr, [value]);
  if (dbOutput.rows.length === 0) {
    return Promise.reject({
      status: 404,
      msg: `Resource not found - ${column}: ${value}`,
    });
  }
};

exports.checkDoesntExist = async (table, column, value) => {
  const queryStr = format("SELECT * FROM %I WHERE %I = $1;", table, column);
  const dbOutput = await db.query(queryStr, [value]);
  if (dbOutput.rows.length > 0) {
    return Promise.reject({
      status: 409,
      msg: `Resource already exists - ${column}: ${value}`,
    });
  }
};
