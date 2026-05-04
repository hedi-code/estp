const db = require('../config/db');
const { syncOption1, deleteAxonautProduct } = require('../axonaut/axonautService');

// Create
exports.createOption1 = (req, res) => {
  const { name, prix_ht, qmax = 1, dispo_si, img, description, ordre = 1 } = req.body;

  db.query(
    `INSERT INTO option1s (name, prix_ht, qmax, dispo_si, img, description, ordre) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, prix_ht, qmax, dispo_si, img, description, ordre],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Erreur lors de l\'insertion' });

      const id = result.insertId;

      res.status(201).json({
        message: 'Option créée avec succès',
        id: id,
        option: {
          id,
          name,
          prix_ht,
          qmax,
          dispo_si,
          img,
          description,
          ordre,
        },
      });

      syncOption1(id).catch(e =>
        console.error(`[Axonaut] syncOption1 create #${id}:`, e.message)
      );
    }
  );
};

// Get all
exports.getAllOption1s = (req, res) => {
  db.query('SELECT * FROM option1s ORDER BY ordre ASC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    const options = results.map(opt => ({
      ...opt,
      img: opt.img ? `/uploads/img/option1s/${opt.id}/${opt.img}` : null,
    }));
    res.json(options);
  });
};

// Get one
exports.getOption1ById = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM option1s WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    if (results.length === 0) return res.status(404).json({ error: 'Option introuvable' });

    const opt = results[0];
    opt.img = opt.img ? `${opt.id}_${opt.img.split('_').slice(1).join('_')}` : null; // Adding id_ prefix
    res.json(opt);
  });
};

// Update
exports.updateOption1 = (req, res) => {
  const { id } = req.params;

  // First get the current option data
  db.query('SELECT * FROM option1s WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ error: 'Option not found' });

    const currentOption = results[0];

    // Merge current data with provided updates
    const updatedData = {
      name: req.body.name !== undefined ? req.body.name : currentOption.name,
      prix_ht: req.body.prix_ht !== undefined ? req.body.prix_ht : currentOption.prix_ht,
      qmax: req.body.qmax !== undefined ? req.body.qmax : currentOption.qmax,
      dispo_si: req.body.dispo_si !== undefined ? req.body.dispo_si : currentOption.dispo_si,
      img: req.body.img !== undefined ? req.body.img : currentOption.img,
      description: req.body.description !== undefined ? req.body.description : currentOption.description,
      ordre: req.body.ordre !== undefined ? req.body.ordre : currentOption.ordre,
    };

    db.query(
      `UPDATE option1s SET name = ?, prix_ht = ?, qmax = ?, dispo_si = ?, description = ?, ordre = ?, img = ? WHERE id = ?`,
      [updatedData.name, updatedData.prix_ht, updatedData.qmax, updatedData.dispo_si, updatedData.description, updatedData.ordre, updatedData.img, id],
      (err) => {
        if (err) return res.status(500).json({ error: err });

        res.json({
          message: 'Option mise à jour avec succès',
          option: {
            id: parseInt(id),
            ...updatedData
          },
        });

        syncOption1(Number(id)).catch(e =>
          console.error(`[Axonaut] syncOption1 update #${id}:`, e.message)
        );
      }
    );
  });
};

// Delete
exports.deleteOption1 = (req, res) => {
  const { id } = req.params;

  db.query('SELECT axonaut_product_id FROM option1s WHERE id = ?', [id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erreur suppression' });

    const axonautProductId = rows[0]?.axonaut_product_id;

    db.query('DELETE FROM option1s WHERE id = ?', [id], (err) => {
      if (err) return res.status(500).json({ error: 'Erreur suppression' });
      res.json({ message: 'Option supprimée avec succès' });

      if (axonautProductId) {
        deleteAxonautProduct(axonautProductId).catch(e =>
          console.error(`[Axonaut] deleteProduct option1 #${id}:`, e.message)
        );
      }
    });
  });
};
