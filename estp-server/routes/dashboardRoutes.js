const express = require("express");
const {
  getCommercialDashboardStats,
  getTopOptions,
  getEntreprisesByOption,
  getAllPaymentStats
} = require("../controllers/dashboardController");

const router = express.Router();

router.get("/commercial/:commercialId", getCommercialDashboardStats);
router.get("/top-options", getTopOptions);
router.get("/entreprises-by-option/:optionId", getEntreprisesByOption);
router.get("/all-payment-stats", getAllPaymentStats);

module.exports = router;