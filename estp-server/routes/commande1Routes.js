// routes/commande1.routes.js

const express = require("express");
const router = express.Router();
const commande1Controller = require("../controllers/commande1Controller");

// Create a new commande
router.post("/", commande1Controller.createCommande1);

// Get all commandes
router.get("/", commande1Controller.getAllCommande1s);

// Get a single commande by ID
router.get("/:id", commande1Controller.getCommande1ById);

// Get commandes by entreprise ID
router.get("/entreprise/:id", commande1Controller.getCommande1ByEntrepriseId);

// Update a commande by ID
router.put("/:id", commande1Controller.updateCommande1);

// Mark invoice as sent
router.put("/facture-envoyee/:id", commande1Controller.setFactureEnvoyee);

// Mark invoice as paid
router.put("/facture-payee/:id", commande1Controller.setFacturePayee);

// Delete a commande by ID
router.delete("/:id", commande1Controller.deleteCommande1);

module.exports = router;
