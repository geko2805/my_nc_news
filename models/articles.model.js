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
  limit = 12,
  hide_negative = false,
  author = null,
  date_range = "all",
  selected_topics = null,
  count_only = false,
  search = null
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
  const validDates = ["all", "week", "month", "year"];
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
  if (!validDates.includes(date_range)) {
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

  // check topic exists if provided for single topic pages
  if (topic !== null) {
    await checkExists("topics", "slug", topic);
  }
  //and check each topic exists for selected topics array
  if (selected_topics !== null) {
    for (const topic of selected_topics) {
      await checkExists("topics", "slug", topic);
    }
  }
  // check author exists
  if (author !== null) {
    await checkExists("users", "username", author);
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
      ${
        search
          ? ", ts_rank(articles.search_vector, plainto_tsquery('english', $1)) AS rank"
          : ""
      }
    FROM articles 
    LEFT OUTER JOIN comments ON articles.article_id = comments.article_id
  `;
  let countQuery = `
    SELECT COUNT(DISTINCT articles.article_id) AS total_count
    FROM articles
  `;
  let conditions = [];
  let queryVals = [];

  // for user entered ssearch, usess plainto to remove white spaces etc
  if (search) {
    const searchQuery = search.trim();
    if (searchQuery) {
      conditions.push(
        `articles.search_vector @@ plainto_tsquery('english', $${
          queryVals.length + 1
        })`
      );
      //uses queryval lengght +1 to generate $1, $2 etc
      queryVals.push(searchQuery);
    }
  }

  // topic filter for single topic from URL on topic pages
  if (topic) {
    conditions.push(`articles.topic = $${queryVals.length + 1}`);
    queryVals.push(topic);
  }

  // Selected topics filter (for multiple topics from filter drawer checkboxes)
  if (selected_topics && selected_topics.length > 0) {
    const placeholders = selected_topics
      .map((_, i) => `$${queryVals.length + i + 1}`)
      .join(",");
    conditions.push(`articles.topic IN (${placeholders})`);
    queryVals.push(...selected_topics);
  }

  // hide negative votes select filter
  if (hide_negative) {
    conditions.push(`articles.votes >= $${queryVals.length + 1}`);
    queryVals.push(0);
  }

  // filter to shoow only articles by logged in user
  if (author) {
    conditions.push(`articles.author = $${queryVals.length + 1}`);
    queryVals.push(author);
  }

  // date published filter
  if (date_range !== "all") {
    let dateCondition;
    const now = new Date();
    if (date_range === "week") {
      dateCondition = `articles.created_at >= $${queryVals.length + 1}`;
      queryVals.push(new Date(now - 7 * 24 * 60 * 60 * 1000));
    } else if (date_range === "month") {
      dateCondition = `articles.created_at >= $${queryVals.length + 1}`;
      queryVals.push(new Date(now - 30 * 24 * 60 * 60 * 1000));
    } else if (date_range === "year") {
      dateCondition = `articles.created_at >= $${queryVals.length + 1}`;
      queryVals.push(new Date(now - 365 * 24 * 60 * 60 * 1000));
    }
    conditions.push(dateCondition);
  }

  // append WHERE clause if conditions exist
  if (conditions.length > 0) {
    const whereClause = "WHERE " + conditions.join(" AND ");
    articlesQuery += ` ${whereClause}`;
    countQuery += ` ${whereClause}`;
  }

  if (count_only) {
    // Only execute count query and return count if count_only = true
    const result = await db.query(countQuery, queryVals);
    return { total_count: parseInt(result.rows[0].total_count, 10) };
  }

  // add end to articles query
  //if search exists, use the ts_rank for order
  articlesQuery += `
  GROUP BY articles.author, articles.title, articles.article_id, 
    articles.created_at, articles.topic, articles.votes, articles.article_img_url
    ${search ? ", rank" : ""}
  ORDER BY ${search ? "rank DESC, " : ""}${orderByColumn} ${upperCaseOrder}
  LIMIT $${queryVals.length + 1} OFFSET $${queryVals.length + 2}
`;
  queryVals.push(limit, offset);

  // execute queries
  const articlesResult = db.query(articlesQuery, queryVals);
  const countResult = db.query(countQuery, queryVals.slice(0, -2)); // count query doesntt need limit and offset

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

exports.removeArticleById = (article_id) => {
  return db
    .query(
      `
    WITH deleted_comments AS (
      DELETE FROM comments
      WHERE article_id = $1
    )
    DELETE FROM articles
    WHERE article_id = $1
    RETURNING *;
    `,
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article doesn't exist" });
      }
      return rows[0];
    });
};
