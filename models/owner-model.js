const mongoose = require("mongoose");
const productModel = require("./product-model");

mongoose.connect(
  "mongodb+srv://binay:binay@vitesdb.mfe5f.mongodb.net/?retryWrites=true&w=majority&appName=vitesdb"
);

const ownerSchema = mongoose.Schema({
  fullname: {
    type: String,
    minLength: 3,
    trim: true,
  },
  email: String,
  password: String,
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
    },
  ],
  picture: String,
  gstin: String,
});

module.exports = mongoose.model("owner", ownerSchema);
