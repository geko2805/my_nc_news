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
