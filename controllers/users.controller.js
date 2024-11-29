const { readAllUsers } = require("../models/users.model");

exports.getUsers = (req, res, next) => {
  readAllUsers()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch(next);
};
