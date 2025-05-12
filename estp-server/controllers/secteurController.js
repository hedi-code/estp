const db = require("../config/db");

// Get all secteurs
exports.getAllSecteurs = (req, res) => {
  db.query('SELECT * FROM secteurs', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// Get one secteur by ID
exports.getSecteurById = (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM secteurs WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(results[0]);
  });
};

// Create new secteur
exports.createSecteur = (req, res) => {
  const { nom } = req.body;
  db.query('INSERT INTO secteurs (nom) VALUES (?)', [nom], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ id: result.insertId, nom });
  });
};

// Update secteur
exports.updateSecteur = (req, res) => {
  const id = req.params.id;
  const { nom } = req.body;
  db.query('UPDATE secteurs SET nom = ? WHERE id = ?', [nom, id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Updated' });
  });
};

// Delete secteur
exports.deleteSecteur = (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM secteurs WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Deleted' });
  });
};

