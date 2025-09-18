const express = require("express");
const {
  addOptionToCommande2,
  getOptionsByCommande2Id,
  updateCommande2Option,
  removeOptionFromCommande2,
  getCommande2OptionById,
  removeAllOptionsFromCommande2
} = require("../controllers/commande2OptionsController");

const router = express.Router();

router.post("/", addOptionToCommande2);
router.get("/commande/:commande2_id", getOptionsByCommande2Id);
router.get("/:id", getCommande2OptionById);
router.put("/:id", updateCommande2Option);
router.delete("/:id", removeOptionFromCommande2);
router.delete("/commande/:commande2_id/all", removeAllOptionsFromCommande2);

module.exports = router;