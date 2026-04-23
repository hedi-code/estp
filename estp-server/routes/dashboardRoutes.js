const express = require("express");
const {
  getCommercialDashboardStats,
  getTopOptions,
  getEntreprisesByOption,
  getAllPaymentStats,
  getBC1PackStats,
  getEntreprisesBySurface
} = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.get("/commercial/:commercialId", authMiddleware, getCommercialDashboardStats);
router.get("/top-options", authMiddleware, getTopOptions);
router.get("/entreprises-by-option/:optionId", authMiddleware, getEntreprisesByOption);
router.get("/all-payment-stats", authMiddleware, getAllPaymentStats);
router.get("/bc1-pack-stats", authMiddleware, getBC1PackStats);
router.get("/entreprises-by-surface/:surfaceId", authMiddleware, getEntreprisesBySurface);

module.exports = router;
