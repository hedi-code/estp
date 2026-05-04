// controllers/pack2Controller.js

const db = require("../config/db");
const { syncPack2, deleteAxonautProduct } = require('../axonaut/axonautService');

exports.createPack2 = (req, res) => {
  const { nom, coloris, prix_ht } = req.body;

  db.query(
    `INSERT INTO pack2s (nom, coloris, prix_ht)
     VALUES (?, ?, ?)`,
    [nom, coloris, prix_ht],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Erreur base de données" });
      res.status(201).json({ message: "Pack 2 créé avec succès", id: result.insertId });

      syncPack2(result.insertId).catch(e =>
        console.error(`[Axonaut] syncPack2 create #${result.insertId}:`, e.message)
      );
    }
  );
};

exports.getAllPack2s = (req, res) => {
  db.query("SELECT * FROM pack2s ORDER BY nom ASC", (err, results) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });
    res.json(results);
  });
};

exports.getPack2ById = (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM pack2s WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });
    if (result.length === 0) return res.status(404).json({ error: "Pack non trouvé" });
    res.json(result[0]);
  });
};

exports.updatePack2 = (req, res) => {
  const id = req.params.id;
  const { nom, coloris, prix_ht } = req.body;

  db.query(
    `UPDATE pack2s SET nom = ?, coloris = ?, prix_ht = ? WHERE id = ?`,
    [nom, coloris, prix_ht, id],
    (err) => {
      if (err) return res.status(500).json({ error: "Erreur base de données" });
      res.json({ message: "Pack 2 mis à jour" });

      syncPack2(Number(id)).catch(e =>
        console.error(`[Axonaut] syncPack2 update #${id}:`, e.message)
      );
    }
  );
};

exports.deletePack2 = (req, res) => {
  const id = req.params.id;

  // Check if pack is used in any commande2
  db.query("SELECT COUNT(*) as count FROM commande2s WHERE pack2_id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });

    if (result[0].count > 0) {
      return res.status(400).json({ error: "Ce pack est utilisé dans des commandes et ne peut pas être supprimé" });
    }

    // Get axonaut_product_id before deleting
    db.query("SELECT axonaut_product_id FROM pack2s WHERE id = ?", [id], (err, packRows) => {
      if (err) return res.status(500).json({ error: "Erreur base de données" });

      const axonautProductId = packRows[0]?.axonaut_product_id;

      db.query("DELETE FROM pack2s WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ error: "Erreur base de données" });
        res.json({ message: "Pack 2 supprimé" });

        if (axonautProductId) {
          deleteAxonautProduct(axonautProductId).catch(e =>
            console.error(`[Axonaut] deleteProduct pack2 #${id}:`, e.message)
          );
        }
      });
    });
  });
};