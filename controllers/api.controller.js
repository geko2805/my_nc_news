const endpointsJson = require("../endpoints.json");

function getApi(req, res) {
  console.log(endpointsJson);
  res.status(200).send({ endpoints: endpointsJson });
}
module.exports = getApi;
