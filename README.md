# Northcoders News API

Project Summary: This is a NEWS API with endpoints to access news articles, users and comments on articles.
It is designed to be able to access app data programmatically in order to provide this data to front-end architecture.

Link to hosted repo: https://my-nc-news-s3ph.onrender.com/
Available endpoints can be found at: https://my-nc-news-s3ph.onrender.com/api
Eg: https://my-nc-news-s3ph.onrender.com/api/articles

This project requires that you have downloaded and minimum version of
• Node.js V14
• PostgreSQL V10

Step 1:
In order to clone this repo and connect databses locally, please create two .env files:
".env.test" - PGDATABASE=test_database_name_here
".env.developer" - PGDATABASE=database_name_here
The Database names can be found in setup.sql

Step 2:
Open package.json and run npm install
This will install all required packages
A list of scripts needed to seed, run and test the project can also be found in the package.JSON file

Step 3:
Seed the project using the script "npm run setup-dbs"
Start the project using "npm run seed"

---

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
git statu
