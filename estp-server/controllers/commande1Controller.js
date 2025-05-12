// controllers/commande1Controller.js

const db = require("../config/db");

exports.createCommande1 = (req, res) => {
  const {
    entreprise_id,
    pack1_id,
    reduc_pct = 0.00,
    reduc_lin = 0.00,
    total_ht_avt_remise = 0.00,
    total_ht = 0.00,
    validation_lieu = null,
  } = req.body;

  const now = new Date();

  db.query(
    `INSERT INTO commande1s (entreprise_id, pack1_id, reduc_pct, reduc_lin, total_ht_avt_remise, total_ht, created, modified, validation_lieu)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      entreprise_id,
      pack1_id,
      reduc_pct,
      reduc_lin,
      total_ht_avt_remise,
      total_ht,
      now,
      now,
      validation_lieu,
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Erreur base de données" });
      res.status(201).json({ message: "Commande créée avec succès", id: result.insertId });
    }
  );
};

exports.getCommande1ById = (req, res) => {
  const id = req.params.id;

  db.query("SELECT * FROM commande1s WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });
    if (result.length === 0) return res.status(404).json({ error: "Commande non trouvée" });
    res.json(result[0]);
  });
};

exports.updateCommande1 = (req, res) => {
  const id = req.params.id;
  const {
    pack1_id,
    reduc_pct,
    reduc_lin,
    total_ht_avt_remise,
    total_ht,
    validation_lieu,
    valide
  } = req.body;

  const modified = new Date();

  db.query(
    `UPDATE commande1s 
     SET pack1_id = ?, reduc_pct = ?, reduc_lin = ?, total_ht_avt_remise = ?, total_ht = ?, validation_lieu = ?, valide = ?, modified = ?
     WHERE id = ?`,
    [
      pack1_id,
      reduc_pct,
      reduc_lin,
      total_ht_avt_remise,
      total_ht,
      validation_lieu,
      valide,
      modified,
      id
    ],
    (err) => {
      if (err) return res.status(500).json({ error: "Erreur base de données" });
      res.json({ message: "Commande mise à jour" });
    }
  );
};

exports.deleteCommande1 = (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM commande1s WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });
    res.json({ message: "Commande supprimée" });
  });
};

exports.getAllCommande1s = (req, res) => {
  db.query("SELECT * FROM commande1s", (err, results) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });
    res.json(results);
  });
};
