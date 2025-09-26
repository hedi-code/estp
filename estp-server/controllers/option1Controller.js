const db = require('../config/db');

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
      }
    );
  });
};

// Delete
exports.deleteOption1 = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM option1s WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Erreur suppression' });
    res.json({ message: 'Option supprimée avec succès' });
  });
};
