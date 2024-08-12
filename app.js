const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const db = require("./config/mongoose-connection");
const usersRouter = require("./routes/usersRouter");
const productsRouter = require("./routes/productsRouter");
const ownersRouter = require("./routes/ownersRouter");
const userModel = require("./models/user-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//middlewares
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.cookie("token", "");
  res.render("index.ejs");
});

app.post("/create", (req, res) => {
  let { fullname, email, password } = req.body;
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let user = await userModel.create({
        fullname,
        email,
        password: hash,
      });
      let token = jwt.sign({ userid: user._id, email: user.email }, "shhhhhhh");
      res.cookie("token", token);
      res.redirect("/products");
    });
  });
});

app.get("/products", (req, res) => {
  if (req.cookies.token === "" || req.cookies.token === undefined) {
    return res.send("You must login first !!");
  }
  jwt.verify(req.cookies.token, "shhhhhhh", (err, decoded) => {
    if (err) {
      return res.send("Something went wrong !");
    }
    res.render("products.ejs");
  });
});

app.use("/users", usersRouter);
app.use("/products", productsRouter);
app.use("/owners", ownersRouter);

//starting server
app.listen(3000);
