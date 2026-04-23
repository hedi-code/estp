const express = require("express");
const {
  createCommande2,
  getCommande2ById,
  getCommande2ByEntrepriseId,
  updateCommande2,
  deleteCommande2,
  getAllCommande2s,
  getCommande2WithDetails,
  setFactureEnvoyee,
  setFacturePayee
} = require("../controllers/commande2Controller");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/", authMiddleware, createCommande2);
router.get("/",authMiddleware,  getAllCommande2s);
router.get("/:id",authMiddleware,  getCommande2ById);
router.get("/entreprise/:id",authMiddleware,  getCommande2ByEntrepriseId);
router.get("/:id/details",authMiddleware,  getCommande2WithDetails);
router.put("/:id", authMiddleware, updateCommande2);
router.put("/:id/facture-envoyee", authMiddleware, setFactureEnvoyee);
router.put("/:id/facture-payee", authMiddleware, setFacturePayee);
router.delete("/:id", authMiddleware, deleteCommande2);

module.exports = router;
