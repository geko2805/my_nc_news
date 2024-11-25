exports.psqlErrorHandler = (err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Invalid article ID" });
  } else {
    next(err);
  }
};

exports.customErrorHandler = (err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(404).send({ msg: "ID not found" });
  } else {
    next(err);
  }
};

exports.serverErrorHandler = (err, req, res, next) => {
  console.log(err, "Server err");
};
