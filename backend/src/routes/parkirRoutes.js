const express = require("express");
const router = express.Router();

const {
  parkirMasuk,
  parkirKeluar,
} = require("../controllers/parkirController");

router.post("/masuk", parkirMasuk);
router.post("/keluar", parkirKeluar);

module.exports = router;
