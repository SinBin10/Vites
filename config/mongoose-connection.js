const mongoose = require("mongoose");
//debugger used for printing errors during development instead of console.log()
// they are only printed when environement variable is set
// development is the namespace
const dbgr = require("debug")("development: mongoose");

//might give error some times so we have to do error handling
mongoose
  .connect("mongodb://127.0.0.1:27017/vitesdb")
  .then(function () {
    dbgr("connected");
  })
  .catch(function (err) {
    dbgr(err);
  });

module.exports = mongoose.connection;
