const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const db = require("./config/mongoose-connection");
const usersRouter = require("./routes/usersRouter");
const productsRouter = require("./routes/productsRouter");
const ownersRouter = require("./routes/ownersRouter");
const userModel = require("./models/user-model");
const productModel = require("./models/product-model");
const ownerModel = require("./models/owner-model");
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
      let owner = await ownerModel.find({});
      if (owner.length === 0) {
        let owner = await ownerModel.create({
          fullname,
          email,
          password: hash,
        });
        let token = jwt.sign(
          { ownerid: owner._id, email: owner.email, isadmin: true },
          "shhhhhhh"
        );
        res.cookie("token", token);
      } else {
        let user = await userModel.create({
          fullname,
          email,
          password: hash,
        });
        let token = jwt.sign(
          { userid: user._id, email: user.email, isadmin: false },
          "shhhhhhh"
        );
        res.cookie("token", token);
      }
      res.redirect("/products");
    });
  });
});

app.post("/login", async (req, res) => {
  let { email } = req.body;
  let owner = await ownerModel.findOne({ email });
  if (owner === null) {
    let user = await userModel.findOne({ email });
    let token = jwt.sign(
      { userid: user._id, email: user.email, isadmin: false },
      "shhhhhhh"
    );
    res.cookie("token", token);
  } else {
    let token = jwt.sign(
      { ownerid: owner._id, email: owner.email, isadmin: true },
      "shhhhhhh"
    );
    res.cookie("token", token);
  }
  res.redirect("/products");
});

app.get("/products", async (req, res) => {
  // let product = await productModel.create({
  //   image: "/images/image 80.png",
  //   name: "Clinge Bag",
  //   price: 1200,
  //   bgcolor: "bg-[#fad1be]",
  //   panelcolor: "bg-[#e59773]",
  //   textcolor: "text-[#6e4a3a]",
  // });
  if (req.cookies.token === "" || req.cookies.token === undefined) {
    return res.send("You must login first !!");
  }
  jwt.verify(req.cookies.token, "shhhhhhh", async (err, decoded) => {
    if (err) {
      return res.send("Something went wrong !");
    }
    let owner = await ownerModel.findOne({ _id: decoded.ownerid });
    // owner.products.push(product);
    // await owner.save();
    let productsarray = owner.products;
    // console.log(productsarray);
    res.render("products.ejs", { decoded, productsarray });
  });
});

app.get("/addproduct", (req, res) => {
  res.render("addproduct.ejs");
});

app.post("/addproduct", (req, res) => {
  res.redirect("/products");
});

//app.use("/users", usersRouter);
//app.use("/products", productsRouter);
//app.use("/owners", ownersRouter);

//starting server
app.listen(3000);
