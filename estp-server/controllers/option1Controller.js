const db = require('../config/db');

// Create
exports.createOption1 = (req, res) => {
  const { name, prix_ht, qmax = 1, dispo_si, img, description, ordre = 1 } = req.body;

  db.query(
    `INSERT INTO option1s (name, prix_ht, qmax, dispo_si, description, ordre) VALUES (?, ?, ?, ?, ?, ?)`,
    [name, prix_ht, qmax, dispo_si, description, ordre],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Erreur lors de l\'insertion' });

      const id = result.insertId;

      res.status(201).json({
        message: 'Option créée avec succès',
        option: {
          id,
          name,
          prix_ht,
          qmax,
          dispo_si,
          img, // Returning img with the id_ prefix
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
      img: opt.img ? `/uploads/img/option1s/${opt.id}/${opt.img}` : null, // Adding id_ prefix
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
  const { name, prix_ht, qmax = 1, dispo_si, img, description, ordre = 1 } = req.body;

  // No update to the img column in the database, just modify the returned value
  let updatedImg = img ? `${id}_${img}` : null;

  db.query(
    `UPDATE option1s SET name = ?, prix_ht = ?, qmax = ?, dispo_si = ?, description = ?, ordre = ? WHERE id = ?`,
    [name, prix_ht, qmax, dispo_si, description, ordre, id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Erreur lors de la mise à jour' });

      res.json({
        message: 'Option mise à jour avec succès',
        option: {
          id,
          name,
          prix_ht,
          qmax,
          dispo_si,
          img: updatedImg, // Returning img with the id_ prefix
          description,
          ordre,
        },
      });
    }
  );
};

// Delete
exports.deleteOption1 = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM option1s WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Erreur suppression' });
    res.json({ message: 'Option supprimée avec succès' });
  });
};
