const express = require("express");
const router = express.Router();

const { getStatCardParkir } = require("../controllers/statcardController");

router.get("/parkir", getStatCardParkir);

module.exports = router;
