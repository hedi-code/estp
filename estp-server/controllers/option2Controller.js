// controllers/option2Controller.js

const db = require("../config/db");

exports.createOption2 = (req, res) => {
  const {
    category_id,
    nom,
    coloris,
    dispo_si,
    img,
    prix_ht,
    taux_tva = 0.00,
    qmax = 1,
    description,
    ordre = 1,
    multiple = 0
  } = req.body;

  db.query(
    `INSERT INTO option2s (category_id, nom, coloris, dispo_si, img, prix_ht, taux_tva, qmax, description, ordre, multiple)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [category_id, nom, coloris, dispo_si, img, prix_ht, taux_tva, qmax, description, ordre, multiple],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Erreur base de données" });
      res.status(201).json({ message: "Option 2 créée avec succès", id: result.insertId });
    }
  );
};

exports.getAllOption2s = (req, res) => {
  const query = `
    SELECT
      o2.*,
      oc.name as category_name
    FROM option2s o2
    LEFT JOIN option2_categories oc ON o2.category_id = oc.id
    ORDER BY o2.ordre ASC, o2.nom ASC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });
    res.json(results);
  });
};

exports.getOption2ById = (req, res) => {
  const id = req.params.id;

  const query = `
    SELECT
      o2.*,
      oc.name as category_name
    FROM option2s o2
    LEFT JOIN option2_categories oc ON o2.category_id = oc.id
    WHERE o2.id = ?
  `;

  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });
    if (result.length === 0) return res.status(404).json({ error: "Option non trouvée" });
    res.json(result[0]);
  });
};

exports.getOption2sByCategory = (req, res) => {
  const category_id = req.params.category_id;

  const query = `
    SELECT
      o2.*,
      oc.name as category_name
    FROM option2s o2
    LEFT JOIN option2_categories oc ON o2.category_id = oc.id
    WHERE o2.category_id = ?
    ORDER BY o2.ordre ASC, o2.nom ASC
  `;

  db.query(query, [category_id], (err, results) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });
    res.json(results);
  });
};

exports.updateOption2 = (req, res) => {
  const id = req.params.id;
  const {
    category_id,
    nom,
    coloris,
    dispo_si,
    img,
    prix_ht,
    taux_tva,
    qmax,
    description,
    ordre,
    multiple
  } = req.body;

  db.query(
    `UPDATE option2s
     SET category_id = ?, nom = ?, coloris = ?, dispo_si = ?, img = ?, prix_ht = ?, taux_tva = ?, qmax = ?, description = ?, ordre = ?, multiple = ?
     WHERE id = ?`,
    [category_id, nom, coloris, dispo_si, img, prix_ht, taux_tva, qmax, description, ordre, multiple, id],
    (err) => {
      if (err) return res.status(500).json({ error: "Erreur base de données" });
      res.json({ message: "Option 2 mise à jour" });
    }
  );
};

exports.deleteOption2 = (req, res) => {
  const id = req.params.id;

  // Check if option is used in any commande2_options
  db.query("SELECT COUNT(*) as count FROM commande2_options WHERE option2_id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });

    if (result[0].count > 0) {
      return res.status(400).json({ error: "Cette option est utilisée dans des commandes et ne peut pas être supprimée" });
    }

    db.query("DELETE FROM option2s WHERE id = ?", [id], (err) => {
      if (err) return res.status(500).json({ error: "Erreur base de données" });
      res.json({ message: "Option 2 supprimée" });
    });
  });
};