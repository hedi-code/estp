// controllers/commande2OptionsController.js

const db = require("../config/db");

exports.addOptionToCommande2 = (req, res) => {
  const { commande2_id, option2_id, qty = 1, color, reduction = 0 } = req.body;

  db.query(
    `INSERT INTO commande2_options (commande2_id, option2_id, qty, color, reduction)
     VALUES (?, ?, ?, ?, ?)`,
    [commande2_id, option2_id, qty, color, reduction],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Erreur base de données" });
      res.status(201).json({ nonDisplayMessage: "Option ajoutée à la commande", id: result.insertId });
    }
  );
};

exports.getOptionsByCommande2Id = (req, res) => {
  const commande2_id = req.params.commande2_id;

  const query = `
    SELECT
      co.*,
      o2.nom as option_nom,
      o2.coloris as option_coloris,
      o2.prix_ht as option_prix_ht,
      o2.taux_tva as option_taux_tva,
      o2.description as option_description,
      o2.img as option_img,
      o2.qmax as option_qmax,
      o2.multiple as option_multiple,
      oc.name as category_name
    FROM commande2_options co
    LEFT JOIN option2s o2 ON co.option2_id = o2.id
    LEFT JOIN option2_categories oc ON o2.category_id = oc.id
    WHERE co.commande2_id = ?
    ORDER BY o2.ordre ASC
  `;

  db.query(query, [commande2_id], (err, results) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });
    res.json(results);
  });
};

exports.updateCommande2Option = (req, res) => {
  const id = req.params.id;
  const { qty, color, reduction } = req.body;

  // Build dynamic query based on provided fields
  const fields = [];
  const values = [];

  if (qty !== undefined) {
    fields.push('qty = ?');
    values.push(qty);
  }
  if (color !== undefined) {
    fields.push('color = ?');
    values.push(color);
  }
  if (reduction !== undefined) {
    fields.push('reduction = ?');
    values.push(reduction);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: "Aucun champ à mettre à jour" });
  }

  values.push(id);

  db.query(
    `UPDATE commande2_options SET ${fields.join(', ')} WHERE id = ?`,
    values,
    (err) => {
      if (err) return res.status(500).json({ error: "Erreur base de données" });
      res.json({ message: "Option de commande mise à jour" });
    }
  );
};

exports.removeOptionFromCommande2 = (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM commande2_options WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });
    res.json({ message: "Option supprimée de la commande" });
  });
};

exports.getCommande2OptionById = (req, res) => {
  const id = req.params.id;

  const query = `
    SELECT
      co.*,
      o2.nom as option_nom,
      o2.coloris as option_coloris,
      o2.prix_ht as option_prix_ht,
      o2.taux_tva as option_taux_tva,
      o2.description as option_description,
      o2.img as option_img,
      o2.qmax as option_qmax,
      o2.multiple as option_multiple,
      oc.name as category_name
    FROM commande2_options co
    LEFT JOIN option2s o2 ON co.option2_id = o2.id
    LEFT JOIN option2_categories oc ON o2.category_id = oc.id
    WHERE co.id = ?
  `;

  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });
    if (result.length === 0) return res.status(404).json({ error: "Option de commande non trouvée" });
    res.json(result[0]);
  });
};

exports.removeAllOptionsFromCommande2 = (req, res) => {
  const commande2_id = req.params.commande2_id;

  db.query("DELETE FROM commande2_options WHERE commande2_id = ?", [commande2_id], (err) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });
    res.json({ message: "Toutes les options supprimées de la commande" });
  });
};