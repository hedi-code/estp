const express = require("express");
const {
  getCommercialDashboardStats,
  getTopOptions
} = require("../controllers/dashboardController");

const router = express.Router();

router.get("/commercial/:commercialId", getCommercialDashboardStats);
router.get("/top-options", getTopOptions);

module.exports = router;