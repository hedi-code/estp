// controllers/commande2Controller.js

const db = require("../config/db");

exports.createCommande2 = (req, res) => {
  const {
    entreprise_id,
    pack2_id,
    pack2_color,
    reduc_pct = 0.00,
    remise_pack_plus,
    total_ht_avt_remise,
    total_ht,
    standiste_nom,
    standiste_prenom,
    standiste_entreprise,
    standiste_telephone,
    standiste_demande,
    standiste_status,
    validation_lieu,
    valide = 0
  } = req.body;

  const now = new Date();

  db.query(
    `SELECT * FROM commande2s WHERE entreprise_id = ?`,
    [entreprise_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Erreur base de données" });
      if (result.length > 0) {
        return res.status(400).json({ error: "Un bon de commande 2 existe déjà pour cette entreprise." });
      }

      db.query(
        `INSERT INTO commande2s (entreprise_id, pack2_id, pack2_color, reduc_pct, remise_pack_plus, valide, total_ht_avt_remise, total_ht, created, modified, standiste_nom, standiste_prenom, standiste_entreprise, standiste_telephone, standiste_demande, standiste_status, validation_lieu)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          entreprise_id,
          pack2_id,
          pack2_color,
          reduc_pct,
          remise_pack_plus,
          valide,
          total_ht_avt_remise,
          total_ht,
          now,
          now,
          standiste_nom,
          standiste_prenom,
          standiste_entreprise,
          standiste_telephone,
          standiste_demande,
          standiste_status,
          validation_lieu
        ],
        (err, result) => {
          if (err) return res.status(500).json({ error: "Erreur base de données" });
          res.status(201).json({ message: "Commande 2 créée avec succès", id: result.insertId });
        }
      );
    }
  );
};

exports.getCommande2ById = (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM commande2s WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });
    if (result.length === 0) return res.status(404).json({ error: "Commande non trouvée" });
    res.json(result[0]);
  });
};

exports.getCommande2ByEntrepriseId = (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM commande2s WHERE entreprise_id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });
    res.json(result[0]);
  });
};

exports.updateCommande2 = (req, res) => {
  const id = req.params.id;
  const {
    pack2_id,
    pack2_color,
    reduc_pct,
    remise_pack_plus,
    total_ht_avt_remise,
    total_ht,
    standiste_nom,
    standiste_prenom,
    standiste_entreprise,
    standiste_telephone,
    standiste_demande,
    standiste_status,
    validation_lieu,
    valide
  } = req.body;

  const modified = new Date();

  db.query(
    `UPDATE commande2s
     SET pack2_id = ?, pack2_color = ?, reduc_pct = ?, remise_pack_plus = ?, total_ht_avt_remise = ?, total_ht = ?, modified = ?, standiste_nom = ?, standiste_prenom = ?, standiste_entreprise = ?, standiste_telephone = ?, standiste_demande = ?, standiste_status = ?, validation_lieu = ?, valide = ?
     WHERE id = ?`,
    [
      pack2_id,
      pack2_color,
      reduc_pct,
      remise_pack_plus,
      total_ht_avt_remise,
      total_ht,
      modified,
      standiste_nom,
      standiste_prenom,
      standiste_entreprise,
      standiste_telephone,
      standiste_demande,
      standiste_status,
      validation_lieu,
      valide,
      id
    ],
    (err) => {
      if (err) return res.status(500).json({ error: "Erreur base de données" });
      res.json({ message: "Commande 2 mise à jour" });
    }
  );
};

exports.deleteCommande2 = (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM commande2s WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });
    res.json({ message: "Commande 2 supprimée" });
  });
};

exports.getAllCommande2s = (req, res) => {
  db.query("SELECT * FROM commande2s", (err, results) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });
    res.json(results);
  });
};

exports.getCommande2WithDetails = (req, res) => {
  const id = req.params.id;

  const query = `
    SELECT
      c2.*,
      p2.nom as pack_nom,
      p2.coloris as pack_coloris,
      p2.prix_ht as pack_prix_ht,
      e.nom as entreprise_nom
    FROM commande2s c2
    LEFT JOIN pack2s p2 ON c2.pack2_id = p2.id
    LEFT JOIN entreprises e ON c2.entreprise_id = e.id
    WHERE c2.id = ?
  `;

  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });
    if (result.length === 0) return res.status(404).json({ error: "Commande non trouvée" });
    res.json(result[0]);
  });
};