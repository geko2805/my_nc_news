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
  topic = null,
  page = 1,
  limit = 12
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

  // validation
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
  if (isNaN(page) || page < 1) {
    return Promise.reject({ status: 400, msg: "Invalid page number" });
  }
  if (isNaN(limit) || limit < 1) {
    return Promise.reject({ status: 400, msg: "Invalid limit" });
  }

  const offset = (page - 1) * limit;
  // Add fix for comment_count alias in ORDER_BY query
  const orderByColumn =
    sort_by === "comment_count" ? "comment_count" : `articles.${sort_by}`;

  let articlesQuery = `
    SELECT articles.author, 
      articles.title, 
      articles.article_id, 
      articles.created_at, 
      articles.topic, 
      articles.votes, 
      articles.article_img_url, 
      CAST(COUNT(comments.comment_id) AS INTEGER) AS comment_count
    FROM articles 
    LEFT OUTER JOIN comments ON articles.article_id = comments.article_id
    WHERE articles.topic = $1 OR $1 IS NULL
    GROUP BY articles.author, articles.title, articles.article_id, 
      articles.created_at, articles.topic, articles.votes, articles.article_img_url
    ORDER BY ${orderByColumn} ${upperCaseOrder}
    LIMIT $2 OFFSET $3
  `;

  let countQuery = `
    SELECT COUNT(DISTINCT articles.article_id) AS total_count
    FROM articles
    WHERE articles.topic = $1 OR $1 IS NULL
  `;

  const queryVals = [topic, limit, offset];

  // Validate topic if provided
  if (topic !== null) {
    await checkExists("topics", "slug", topic);
  }

  const articlesResult = db.query(articlesQuery, queryVals);
  const countResult = db.query(countQuery, [topic]); // Count query only needs topic

  return Promise.all([articlesResult, countResult]).then(
    ([articlesData, countData]) => {
      const articles = articlesData.rows;
      const total_count = parseInt(countData.rows[0].total_count, 10);
      return { articles, total_count };
    }
  );
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

exports.insertArticle = async (author, title, body, topic, article_img_url) => {
  console.log("hello from model");
  if (!author) {
    return Promise.reject({
      status: 400,
      msg: "Bad request - No author",
    });
  } else if (!title) {
    return Promise.reject({
      status: 400,
      msg: "Bad request - No title",
    });
  } else if (!topic) {
    return Promise.reject({
      status: 400,
      msg: "Bad request - No topic",
    });
  } else if (!body) {
    return Promise.reject({
      status: 400,
      msg: "Bad request - No body",
    });
  } else {
    await checkExists("users", "username", author);
    await checkExists("topics", "slug", topic);
    if (!article_img_url || article_img_url.length === 0) {
      article_img_url =
        "https://images.unsplash.com/photo-1586880234202-32a56790c681?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
    }
    return db
      .query(
        `INSERT INTO articles (author, title, body, topic, article_img_url)
    VALUES ($1, $2, $3, $4, $5) RETURNING *, 0 AS comment_count;`,
        [author, title, body, topic, article_img_url]
      )
      .then(({ rows }) => {
        return rows[0];
      });
  }
};
