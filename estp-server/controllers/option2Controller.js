// controllers/option2Controller.js

const db = require("../config/db");
const { syncOption2, deleteAxonautProduct } = require('../axonaut/axonautService');

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

      syncOption2(result.insertId).catch(e =>
        console.error(`[Axonaut] syncOption2 create #${result.insertId}:`, e.message)
      );
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
  console.log('updateOption2 called with ID:', id);
  console.log('Request body:', JSON.stringify(req.body, null, 2));

  const allowedFields = [
    'category_id', 'nom', 'coloris', 'dispo_si', 'img',
    'prix_ht', 'taux_tva', 'qmax', 'description', 'ordre', 'multiple'
  ];

  // Build dynamic UPDATE query based on provided fields
  const updates = [];
  const values = [];

  allowedFields.forEach(field => {
    if (req.body.hasOwnProperty(field)) {
      updates.push(`${field} = ?`);
      values.push(req.body[field]);
      console.log(`Field to update: ${field} = ${req.body[field]}`);
    }
  });

  if (updates.length === 0) {
    console.log('No fields to update');
    return res.status(400).json({ error: "Aucun champ à mettre à jour" });
  }

  values.push(id); // Add id for WHERE clause

  const query = `UPDATE option2s SET ${updates.join(', ')} WHERE id = ?`;
  console.log('SQL Query:', query);
  console.log('SQL Values:', values);

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Error updating option2:", err);
      return res.status(500).json({ error: "Erreur base de données" });
    }
    console.log('Update successful. Affected rows:', result.affectedRows);
    res.json({ message: "Option 2 mise à jour" });

    syncOption2(Number(id)).catch(e =>
      console.error(`[Axonaut] syncOption2 update #${id}:`, e.message)
    );
  });
};

exports.deleteOption2 = (req, res) => {
  const id = req.params.id;

  // Check if option is used in any commande2_options
  db.query("SELECT COUNT(*) as count FROM commande2_options WHERE option2_id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });

    if (result[0].count > 0) {
      return res.status(400).json({ error: "Cette option est utilisée dans des commandes et ne peut pas être supprimée" });
    }

    // Get axonaut_product_id before deleting
    db.query("SELECT axonaut_product_id FROM option2s WHERE id = ?", [id], (err, optRows) => {
      if (err) return res.status(500).json({ error: "Erreur base de données" });

      const axonautProductId = optRows[0]?.axonaut_product_id;

      db.query("DELETE FROM option2s WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ error: "Erreur base de données" });
        res.json({ message: "Option 2 supprimée" });

        if (axonautProductId) {
          deleteAxonautProduct(axonautProductId).catch(e =>
            console.error(`[Axonaut] deleteProduct option2 #${id}:`, e.message)
          );
        }
      });
    });
  });
};