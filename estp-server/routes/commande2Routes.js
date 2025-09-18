const express = require("express");
const {
  createCommande2,
  getCommande2ById,
  getCommande2ByEntrepriseId,
  updateCommande2,
  deleteCommande2,
  getAllCommande2s,
  getCommande2WithDetails
} = require("../controllers/commande2Controller");

const router = express.Router();

router.post("/", createCommande2);
router.get("/", getAllCommande2s);
router.get("/:id", getCommande2ById);
router.get("/entreprise/:id", getCommande2ByEntrepriseId);
router.get("/:id/details", getCommande2WithDetails);
router.put("/:id", updateCommande2);
router.delete("/:id", deleteCommande2);

module.exports = router;