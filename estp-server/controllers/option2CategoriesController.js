// controllers/option2CategoriesController.js

const db = require("../config/db");

exports.createOption2Category = (req, res) => {
  const { name } = req.body;

  db.query(
    `INSERT INTO option2_categories (name) VALUES (?)`,
    [name],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Erreur base de données" });
      res.status(201).json({ message: "Catégorie d'option 2 créée avec succès", id: result.insertId });
    }
  );
};

exports.getAllOption2Categories = (req, res) => {
  db.query("SELECT * FROM option2_categories ORDER BY name ASC", (err, results) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });
    res.json(results);
  });
};

exports.getOption2CategoryById = (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM option2_categories WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });
    if (result.length === 0) return res.status(404).json({ error: "Catégorie non trouvée" });
    res.json(result[0]);
  });
};

exports.getOption2CategoryWithOptions = (req, res) => {
  const id = req.params.id;

  const query = `
    SELECT
      oc.*,
      o2.id as option_id,
      o2.nom as option_nom,
      o2.coloris as option_coloris,
      o2.prix_ht as option_prix_ht,
      o2.taux_tva as option_taux_tva,
      o2.description as option_description,
      o2.img as option_img,
      o2.qmax as option_qmax,
      o2.multiple as option_multiple,
      o2.ordre as option_ordre
    FROM option2_categories oc
    LEFT JOIN option2s o2 ON oc.id = o2.category_id
    WHERE oc.id = ?
    ORDER BY o2.ordre ASC, o2.nom ASC
  `;

  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });
    if (results.length === 0) return res.status(404).json({ error: "Catégorie non trouvée" });

    const category = {
      id: results[0].id,
      name: results[0].name,
      options: results[0].option_id ? results.map(row => ({
        id: row.option_id,
        nom: row.option_nom,
        coloris: row.option_coloris,
        prix_ht: row.option_prix_ht,
        taux_tva: row.option_taux_tva,
        description: row.option_description,
        img: row.option_img,
        qmax: row.option_qmax,
        multiple: row.option_multiple,
        ordre: row.option_ordre
      })) : []
    };

    res.json(category);
  });
};

exports.updateOption2Category = (req, res) => {
  const id = req.params.id;
  const { name } = req.body;

  db.query(
    `UPDATE option2_categories SET name = ? WHERE id = ?`,
    [name, id],
    (err) => {
      if (err) return res.status(500).json({ error: "Erreur base de données" });
      res.json({ message: "Catégorie d'option 2 mise à jour" });
    }
  );
};

exports.deleteOption2Category = (req, res) => {
  const id = req.params.id;

  // Check if category has options
  db.query("SELECT COUNT(*) as count FROM option2s WHERE category_id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });

    if (result[0].count > 0) {
      return res.status(400).json({ error: "Cette catégorie contient des options et ne peut pas être supprimée" });
    }

    db.query("DELETE FROM option2_categories WHERE id = ?", [id], (err) => {
      if (err) return res.status(500).json({ error: "Erreur base de données" });
      res.json({ message: "Catégorie d'option 2 supprimée" });
    });
  });
};