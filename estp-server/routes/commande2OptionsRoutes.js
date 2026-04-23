const express = require("express");
const {
  addOptionToCommande2,
  getOptionsByCommande2Id,
  updateCommande2Option,
  removeOptionFromCommande2,
  getCommande2OptionById,
  removeAllOptionsFromCommande2
} = require("../controllers/commande2OptionsController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/", authMiddleware, addOptionToCommande2);
router.get("/commande/:commande2_id",authMiddleware, getOptionsByCommande2Id);
router.get("/:id",authMiddleware, getCommande2OptionById);
router.put("/:id", authMiddleware, updateCommande2Option);
router.delete("/:id", authMiddleware, removeOptionFromCommande2);
router.delete("/commande/:commande2_id/all", authMiddleware, removeAllOptionsFromCommande2);

module.exports = router;
