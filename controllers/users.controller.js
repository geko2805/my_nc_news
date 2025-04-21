const {
  readAllUsers,
  readUserByUsername,
  updateUser,
  insertUser,
} = require("../models/users.model");

exports.getUsers = (req, res, next) => {
  readAllUsers()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch(next);
};

exports.getUserByUsername = (req, res, next) => {
  const { username } = req.params;
  readUserByUsername(username)
    .then((user) => {
      res.status(200).send({ user });
    })
    .catch(next);
};

exports.patchUser = (req, res, next) => {
  const { username } = req.params;
  const { avatar_url } = req.body;

  updateUser(username, avatar_url)
    .then((user) => {
      res.status(202).send({ user });
    })
    .catch(next);
};

exports.postUser = (req, res, next) => {
  const { name, username, avatar_url } = req.body;

  insertUser(name, username, avatar_url)
    .then((user) => {
      res.status(201).send({ user });
    })
    .catch(next);
};
