const { readAllTopics } = require("../models/topics.model");

exports.getTopics = (req, res, next) => {
  console.log("hello from the controller");

  readAllTopics()
    .then((topics) => {
      console.log(topics);
      res.status(200).send({ topics });
    })
    .catch(next);
};
