const express = require("express");
const {
  getCommercialDashboardStats,
  getTopOptions,
  getEntreprisesByOption,
  getAllPaymentStats,
  getBC1PackStats
} = require("../controllers/dashboardController");

const router = express.Router();

router.get("/commercial/:commercialId", getCommercialDashboardStats);
router.get("/top-options", getTopOptions);
router.get("/entreprises-by-option/:optionId", getEntreprisesByOption);
router.get("/all-payment-stats", getAllPaymentStats);
router.get("/bc1-pack-stats", getBC1PackStats);

module.exports = router;