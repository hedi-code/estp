// routes/commande1Options.routes.js

const express = require("express");
const router = express.Router();
const commande1OptionsController = require("../controllers/commande1OptionsController");

// Create a new commande1 option
router.post("/", commande1OptionsController.createCommande1Option);

// Get all commande1 options
router.get("/", commande1OptionsController.getAllCommande1Options);

// Get a single commande1 option by ID
router.get("/:id", commande1OptionsController.getCommande1OptionById);

// Update a commande1 option by ID
router.put("/:id", commande1OptionsController.updateCommande1Option);

// Delete a commande1 option by ID
router.delete("/:id", commande1OptionsController.deleteCommande1Option);

module.exports = router;
