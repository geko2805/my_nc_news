exports.psqlErrorHandler = (err, req, res, next) => {
  if (err.code === "22P02") {
    console.log("err 22P02");
  } else {
    next(err);
  }
};

exports.customErrorHandler = (err, req, res, next) => {
  if (err.status && err.message) {
    console.log(err.status);
  } else {
    next(err);
  }
};

exports.serverErrorHandler = (err, req, res, next) => {
  console.log(err, "Server err");
};
