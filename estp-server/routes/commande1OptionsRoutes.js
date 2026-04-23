// routes/commande1Options.routes.js

const express = require("express");
const router = express.Router();
const commande1OptionsController = require("../controllers/commande1OptionsController");
const authMiddleware = require("../middleware/auth");

// Create a new commande1 option
router.post("/", authMiddleware, commande1OptionsController.createCommande1Option);

// Get all commande1 options
router.get("/", authMiddleware,commande1OptionsController.getAllCommande1Options);

// Get a single commande1 option by ID
router.get("/:id", authMiddleware,commande1OptionsController.getCommande1OptionById);
router.get("/commande/:id",authMiddleware, commande1OptionsController.getCommande1OptionByCommandeId);

// Update a commande1 option by ID
router.put("/:id", authMiddleware, commande1OptionsController.updateCommande1Option);

// Delete a commande1 option by ID
router.delete("/:id", authMiddleware, commande1OptionsController.deleteCommande1Option);

module.exports = router;
