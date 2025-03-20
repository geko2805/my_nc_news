const db = require("../db/connection");
const { checkExists } = require("../utils/utils");

exports.readArticleById = (article_id) => {
  let queryString = `SELECT articles.author, 
      articles.title, 
      articles.article_id, 
      articles.created_at, 
      articles.topic, 
      articles.votes, 
      articles.body,
      articles.article_img_url, 
      CAST(COUNT(comments.comment_id) AS INTEGER) AS comment_count
        FROM articles
        LEFT OUTER JOIN comments ON articles.article_id = comments.article_id
        WHERE articles.article_id = $1
        GROUP BY articles.author, articles.title, articles.article_id, articles.created_at, articles.topic, articles.votes, articles.article_img_url;`;
  const queryVals = [article_id];

  return db.query(queryString, queryVals).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "ID not found" });
    }
    return rows[0];
  });
};
exports.readAllArticles = async (
  sort_by = "created_at",
  order = "DESC",
  topic
) => {
  const validSorts = [
    "created_at",
    "title",
    "topic",
    "author",
    "votes",
    "comment_count",
  ];
  const validOrders = ["DESC", "ASC"];
  const upperCaseOrder = order.toUpperCase();

  if (!validSorts.includes(sort_by)) {
    return Promise.reject({
      status: 400,
      msg: "Bad request",
    });
  }
  if (!validOrders.includes(upperCaseOrder)) {
    return Promise.reject({
      status: 400,
      msg: "Bad request",
    });
  }

  // Add fix for comment_count alias in ORDER_BY query
  const orderByColumn = sort_by === "comment_count" ? "comment_count" : sort_by;

  if (!topic) {
    return db
      .query(
        `SELECT articles.author, 
      articles.title, 
      articles.article_id, 
      articles.created_at, 
      articles.topic, 
      articles.votes, 
      articles.article_img_url, 
      CAST(COUNT(comments.comment_id) AS INTEGER) AS comment_count
        FROM articles 
        LEFT OUTER JOIN comments ON articles.article_id = comments.article_id 
        GROUP BY articles.author, articles.title, articles.article_id, articles.created_at, articles.topic, articles.votes, articles.article_img_url
        ORDER BY articles.${orderByColumn} ${upperCaseOrder};`
      )
      .then(({ rows }) => {
        return rows;
      });
  } else {
    await checkExists("topics", "slug", topic);

    return db
      .query(
        `SELECT articles.author, 
    articles.title, 
    articles.article_id, 
    articles.created_at, 
    articles.topic, 
    articles.votes, 
    articles.article_img_url, 
    CAST(COUNT(comments.comment_id) AS INTEGER) AS comment_count
      FROM articles 
      LEFT OUTER JOIN comments ON articles.article_id = comments.article_id 
      WHERE articles.topic = $1
      GROUP BY articles.author, articles.title, articles.article_id, articles.created_at, articles.topic, articles.votes, articles.article_img_url
      ORDER BY articles.${orderByColumn} ${upperCaseOrder};`,
        [topic]
      )
      .then(({ rows }) => {
        return rows;
      });
  }
};

exports.updateArticle = (article_id, inc_votes) => {
  return db
    .query(
      `UPDATE articles
    SET votes= votes + $1
    WHERE article_id =$2
    RETURNING *;`,
      [inc_votes, article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "ID not found" });
      }
      return rows[0];
    });
};
