const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  fullname: String,
  email: String,
  password: String,
  cart: {
    type: Array,
    default: [],
  },
  isadmin: Boolean,
  orders: {
    type: Array,
    default: [],
  },
  contact: Number,
  image: String,
});

module.exports = mongoose.model("user", productSchema);
