// routes/commande1.routes.js

const express = require("express");
const router = express.Router();
const commande1Controller = require("../controllers/commande1Controller");
const authMiddleware = require("../middleware/auth");

// Create a new commande
router.post("/", authMiddleware, commande1Controller.createCommande1);

// Get all commandes
router.get("/", authMiddleware, commande1Controller.getAllCommande1s);

// Get a single commande by ID
router.get("/:id",authMiddleware,  commande1Controller.getCommande1ById);

// Get commandes by entreprise ID
router.get("/entreprise/:id", authMiddleware, commande1Controller.getCommande1ByEntrepriseId);

// Update a commande by ID
router.put("/:id", authMiddleware, commande1Controller.updateCommande1);

// Mark invoice as sent
router.put("/facture-envoyee/:id", authMiddleware, commande1Controller.setFactureEnvoyee);

// Mark invoice as paid
router.put("/facture-payee/:id", authMiddleware, commande1Controller.setFacturePayee);

// Delete a commande by ID
router.delete("/:id", authMiddleware, commande1Controller.deleteCommande1);

module.exports = router;
