const request = require("supertest");
const app = require("../app");
const endpointsJson = require("../endpoints.json");
/* Set up your test imports here */
const testData = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const db = require("../db/connection");

/* Set up your beforeEach & afterAll functions here */
beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  return db.end();
});

describe("Route not found error handler", () => {
  test("404: Responds with a status 404 and message Route not found", () => {
    return request(app)
      .get("/api/not-a-valid-route")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toEqual("Route not found");
      });
  });
});

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe("GET /api/topics", () => {
  test("200: Responds with an array of topic objects with slug and description properties", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(topics.length).not.toBe(0);
        topics.forEach((topic) => {
          expect(typeof topic.slug).toBe("string");
          expect(typeof topic.description).toBe("string");
        });
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("200: Responds with an article object with correct properties", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(typeof article.author).toBe("string");
        expect(typeof article.title).toBe("string");
        expect(typeof article.article_id).toBe("number");
        expect(typeof article.body).toBe("string");
        expect(typeof article.topic).toBe("string");
        expect(typeof article.created_at).toBe("string");
        expect(typeof article.votes).toBe("number");
        expect(typeof article.article_img_url).toBe("string");
      });
  });

  test("400: Responds with status 400 and an error message if passed an invalid artcile_id", () => {
    return request(app)
      .get("/api/articles/not-an-artcile-id")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Invalid article ID");
      });
  });

  test("404: Responds with status 404 and an error message if passed a valid artcile_id which does not exist in the database", () => {
    return request(app)
      .get("/api/articles/3000")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("ID not found");
      });
  });
});

describe("GET /api/articles", () => {
  test("200: Responds with an array of article objects with correct properties", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).not.toBe(0);
        articles.forEach((article) => {
          expect(article).not.toHaveProperty("body");

          expect(typeof article.author).toBe("string");
          expect(typeof article.title).toBe("string");
          expect(typeof article.article_id).toBe("number");
          expect(typeof article.topic).toBe("string");
          expect(typeof article.created_at).toBe("string");
          expect(typeof article.votes).toBe("number");
          expect(typeof article.article_img_url).toBe("string");
          expect(typeof article.comment_count).toBe("number");
        });

        expect(articles).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200: Responds with an array of comments for given article_id with correct properties", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        comments.forEach((comment) => {
          expect(typeof comment.comment_id).toBe("number");
          expect(typeof comment.votes).toBe("number");
          expect(typeof comment.created_at).toBe("string");
          expect(typeof comment.author).toBe("string");
          expect(typeof comment.body).toBe("string");
          expect(typeof comment.article_id).toBe("number");
        });

        expect(comments).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });

  test("200: Responds with status 200 and an error message if passed a valid artcile_id which exists but has no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("No comments for this article");
      });
  });

  test("404: Responds with status 404 and an error message if passed a valid artcile_id which does not exist in the database", () => {
    return request(app)
      .get("/api/articles/3000/comments")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("ID not found");
      });
  });

  test("400: Responds with status 400 and an error message if passed an invalid artcile_id", () => {
    return request(app)
      .get("/api/articles/not-an-artcile-id/comments")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Invalid article ID");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("POST:201 inserts a new comment to the db and sends the new comment back to the client", () => {
    const testComment = {
      username: "rogersop",
      body: "This is a test comment",
    };
    return request(app)
      .post("/api/articles/3/comments")
      .send(testComment)
      .expect(201)
      .then(({ body: { comment } }) => {
        expect(comment.body).toBe("This is a test comment");
        expect(comment.article_id).toBe(3);
        expect(comment.author).toBe("rogersop");
        expect(comment.votes).toBe(0);
        expect(typeof comment.created_at).toBe("string");
        expect(typeof comment.comment_id).toBe("number");
      });
  });
  test("POST:400 responds with an appropriate status and error message when provided with a bad comment (no comment body)", () => {
    const testComment = {
      username: "rogersop",
    };
    return request(app)
      .post("/api/articles/3/comments")
      .send(testComment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request - No Comment body");
      });
  });

  test("POST:404 responds with an appropriate status and error message when provided with a username which doesn't exist", () => {
    const testComment = {
      username: "testUser",
      body: "This is a test comment",
    };
    return request(app)
      .post("/api/articles/3/comments")
      .send(testComment)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Resource not found");
      });
  });

  test("POST:404: Responds with status 404 and an error message when passed an article_id which doesn't exist", () => {
    const testComment = {
      username: "rogersop",
      body: "This is a test comment",
    };
    return request(app)
      .post("/api/articles/3000/comments")
      .send(testComment)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Resource not found");
      });
  });
});
