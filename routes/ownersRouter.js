const express = require("express");
const router = express.Router();

//even if we forget to remove this code still this code wont be uploaded to production
if (process.env.NODE_ENV === "development") {
  console.log("working...");
  router.post("/c", (req, res) => {
    res.send("its working absolutely fine !!");
  });
}

router.get("/", (req, res) => {
  res.send("its working absolutely fine !!");
});

module.exports = router;
