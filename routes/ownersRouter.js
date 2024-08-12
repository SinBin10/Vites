const express = require("express");
const router = express.Router();
const ownerModel = require("../models/owner-model");

//even if we forget to remove this code still this code wont be uploaded to production
if (process.env.NODE_ENV === "development") {
  router.post("/create", async (req, res) => {
    let owner = await ownerModel.find();
    if (owner.length > 0) {
      return res.status(503).send("Not permitted to create an owner");
    }
    let { fullname, email, password } = req.body;
    owner = await ownerModel.create({
      fullname,
      email,
      password,
    });
    res.status(201).send(owner);
  });
}

router.get("/", (req, res) => {
  res.send("its working absolutely fine !!");
});

module.exports = router;
