const db = require("../config/db");

// Get all exposants
exports.getAllExposants = (req, res) => {
  db.query('SELECT * FROM exposants', (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};

// Get all exposants with entreprise information
exports.getAllExposantsWithEntreprise = (req, res) => {
  const query = `
    SELECT
      e.id,
      e.entreprise_id,
      e.nom,
      e.prenom,
      e.fonction,
      e.created,
      e.modified,
      ent.nom as entreprise_nom,
      ent.siren as entreprise_siren,
      ent.adresse as entreprise_adresse
    FROM exposants e
    LEFT JOIN entreprises ent ON e.entreprise_id = ent.id
    ORDER BY ent.nom, e.nom, e.prenom
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};

// Get exposants by entreprise_id
exports.getExposantsByEntreprise = (req, res) => {
  const { entreprise_id } = req.params;
  db.query('SELECT * FROM exposants WHERE entreprise_id = ?', [entreprise_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};

// Get exposant by ID
exports.getExposantById = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM exposants WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: 'Exposant not found' });
    res.json(result[0]);
  });
};

// Create new exposant
exports.createExposant = (req, res) => {
  const { entreprise_id, nom, prenom, fonction } = req.body;
  const created = new Date();
  const modified = new Date();

  db.query(
    'INSERT INTO exposants (entreprise_id, nom, prenom, fonction, created, modified) VALUES (?, ?, ?, ?, ?, ?)',
    [entreprise_id, nom, prenom, fonction, created, modified],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Exposant created', id: result.insertId });
    }
  );
};

// Update exposant
exports.updateExposant = (req, res) => {
  const { id } = req.params;
  const { nom, prenom, fonction } = req.body;
  const modified = new Date();

  db.query(
    'UPDATE exposants SET nom = ?, prenom = ?, fonction = ?, modified = ? WHERE id = ?',
    [nom, prenom, fonction, modified, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Exposant not found' });
      res.json({ message: 'Exposant updated successfully', affectedRows: result.affectedRows });
    }
  );
};

// Delete exposant
exports.deleteExposant = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM exposants WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Exposant not found' });
    res.json({ nonDisplayMessage: 'Exposant deleted successfully', affectedRows: result.affectedRows });
  });
};
