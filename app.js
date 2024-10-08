const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const userModel = require("./models/user-model");
const productModel = require("./models/product-model");
const ownerModel = require("./models/owner-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const secretKey = process.env.SECRET_KEY;

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
          secretKey
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
          secretKey
        );
        res.cookie("token", token);
      }
      res.redirect("/products");
    });
  });
});

app.post("/login", async (req, res) => {
  let { email, password } = req.body;
  let owner = await ownerModel.findOne({ email });
  if (owner === null) {
    let user = await userModel.findOne({ email });
    if (user === null) {
      res.send("Account not found !! Please create an account first");
    } else {
      bcrypt.compare(password, user.password, (err, result) => {
        if (result === false) {
          res.send("Something went wrong !!");
        } else {
          let token = jwt.sign(
            { userid: user._id, email: user.email, isadmin: false },
            secretKey
          );
          res.cookie("token", token);
          res.redirect("/products");
        }
      });
    }
  } else {
    bcrypt.compare(password, owner.password, (err, result) => {
      if (result === false) {
        res.send("Something went wrong !!");
      } else {
        let token = jwt.sign(
          { ownerid: owner._id, email: owner.email, isadmin: true },
          secretKey
        );
        res.cookie("token", token);
        res.redirect("/products");
      }
    });
  }
});

app.get("/products", async (req, res) => {
  if (req.cookies.token === "" || req.cookies.token === undefined) {
    return res.send("You must login first !!");
  }
  jwt.verify(req.cookies.token, secretKey, async (err, decoded) => {
    if (err) {
      return res.send("Something went wrong !");
    }
    let user = await userModel.findOne({ _id: decoded.userid });
    if (user !== null) {
      user.cart = [];
      await user.save();
    }
    let owner = await ownerModel.findOne({ _id: "66be4e77b6dde749c38f9dc0" });
    if (owner.products.length !== 0) await owner.populate("products");
    let productsarray = owner.products;
    res.render("products.ejs", { decoded, productsarray });
  });
});

app.get("/addproduct", (req, res) => {
  res.render("addproduct.ejs");
});

app.post("/addproduct", async (req, res) => {
  let { productimage, productname, price, bgcolor, panelcolor, textcolor } =
    req.body;
  jwt.verify(req.cookies.token, secretKey, async (err, decoded) => {
    if (err) {
      return res.send("Something went wrong !");
    }
    let newproduct = await productModel.create({
      image: productimage,
      name: productname,
      price,
      bgcolor,
      panelcolor,
      textcolor,
    });
    let owner = await ownerModel.findOne({ _id: decoded.ownerid });
    owner.products.push(newproduct._id);
    await owner.save();
    res.redirect("/products");
  });
});

app.get("/cart/:productid", (req, res) => {
  jwt.verify(req.cookies.token, secretKey, async (err, decoded) => {
    if (err) {
      res.send("Something went wrong...");
    } else {
      let user = await userModel.findOne({ _id: decoded.userid });
      if (user.cart.length === 0) {
        user.cart.push(req.params.productid);
        await user.save();
      }
      await user.populate("cart");
      let userproduct = user.cart;
      res.render("cart.ejs", { userproduct });
    }
  });
});

app.get("/increaseitem/:productid", (req, res) => {
  jwt.verify(req.cookies.token, secretKey, async (err, decoded) => {
    if (err) {
      res.send("Something went wrong...");
    } else {
      let user = await userModel.findOne({ _id: decoded.userid });
      user.cart.push(req.params.productid);
      await user.save();
      res.redirect(`/cart/${req.params.productid}`);
    }
  });
});

app.get("/reduceitem/:productid", (req, res) => {
  jwt.verify(req.cookies.token, secretKey, async (err, decoded) => {
    if (err) {
      res.send("Something went wrong...");
    } else {
      let user = await userModel.findOne({ _id: decoded.userid });
      if (user.cart.length === 1) return res.redirect("/products");
      else {
        user.cart.pop();
        await user.save();
        res.redirect(`/cart/${req.params.productid}`);
      }
    }
  });
});

app.get("/placeorder/:productid", (req, res) => {
  jwt.verify(req.cookies.token, secretKey, async (err, decoded) => {
    if (err) {
      res.send("something went wrong");
    } else {
      let user = await userModel.findOne({ _id: decoded.userid });
      user.orders.push(...user.cart);
      user.cart = [];
      await user.save();
      res.render("order.ejs");
    }
  });
});

app.get("/delete/:productid", (req, res) => {
  jwt.verify(req.cookies.token, secretKey, async (err, decoded) => {
    if (err) {
      res.send("Something went wrong !!");
    } else {
      let owner = await ownerModel.findOne({ _id: decoded.ownerid });
      await owner.populate("products");
      const productIndex = owner.products.findIndex(
        (product) => product._id === req.params.productid
      );
      owner.products.splice(productIndex, 1);
      await owner.save();
      await productModel.findOneAndDelete({
        _id: req.params.productid,
      });
      res.redirect("/products");
    }
  });
});

app.get("/edit/:productid", (req, res) => {
  jwt.verify(req.cookies.token, secretKey, async (err, decoded) => {
    if (err) {
      res.send("Something went wrong !!");
    } else {
      let product = await productModel.findOne({ _id: req.params.productid });
      res.render("edit.ejs", { product });
    }
  });
});

app.post("/edit/:productid", async (req, res) => {
  await productModel.findOneAndUpdate(
    { _id: req.params.productid },
    {
      image: req.body.productimage,
      name: req.body.productname,
      price: req.body.price,
      bgcolor: req.body.bgcolor,
      panelcolor: req.body.panelcolor,
      textcolor: req.body.textcolor,
    },
    { new: true }
  );
  res.redirect("/products");
});

app.get("/cart", (req, res) => {
  res.send("Your cart is empty... Please add items");
});

app.get("/account", (req, res) => {
  res.send("This page is currenlty under maintenance...");
});
app.listen(3000);
