const express = require("express");
const {
  getCommercialDashboardStats,
  getTopOptions,
  getEntreprisesByOption
} = require("../controllers/dashboardController");

const router = express.Router();

router.get("/commercial/:commercialId", getCommercialDashboardStats);
router.get("/top-options", getTopOptions);
router.get("/entreprises-by-option/:optionId", getEntreprisesByOption);

module.exports = router;