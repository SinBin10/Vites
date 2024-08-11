const mongoose = require("mongoose");

//might give error some times so we have to do error handling
mongoose
  .connect("mongodb://127.0.0.1:27017/vitesdb")
  .then(function () {
    console.log("connected");
  })
  .catch(function (err) {
    console.log(err);
  });

module.exports = mongoose.connection;
