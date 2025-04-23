const db = require('../config/db');

// Get all entreprises
exports.getAllEntreprises = (req, res) => {
  db.query('SELECT * FROM entreprises', (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });
    res.json(results);
  });
};

// Get entreprise by ID
exports.getEntrepriseById = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM entreprises WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Entreprise non trouvée' });
    res.json(results[0]);
  });
};
// Internal helper inside the same file
 async function _getEntrepriseByUserId(id) {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM entreprises WHERE user_id = ?', [id], (err, results) => {
      if (err) return reject(err);
      if (results.length === 0) return resolve(null);
      resolve(results[0]);
    });
  });
}
exports.getEntrepriseByUserId = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM entreprises WHERE user_id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Entreprise non trouvée' });
    res.json(results[0]);
  });
};
// Create entreprise and return the inserted row
exports.createEntreprise = (req, res) => {
  const {
    contact_principal_id, user_id, commercial_id, secteur_id,
    nom, logo, siren, adresse, created, modified,
    telephone_standard, telephone_fax, siteweb,
    fct_adresse, fct_nom, has_participated, activity
  } = req.body;

  const insertQuery = `
    INSERT INTO entreprises (
      contact_principal_id, user_id, commercial_id, secteur_id,
      nom, logo, siren, adresse, created, modified,
      telephone_standard, telephone_fax, siteweb,
      fct_adresse, fct_nom, has_participated, activity
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    contact_principal_id, user_id, commercial_id, secteur_id,
    nom, logo, siren, adresse, created, modified,
    telephone_standard, telephone_fax, siteweb,
    fct_adresse, fct_nom, has_participated, activity
  ];

  db.query(insertQuery, values, (err, result) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });

    const insertedId = result.insertId;
    db.query('SELECT * FROM entreprises WHERE id = ?', [insertedId], (err2, inserted) => {
      if (err2) return res.status(500).json({ message: 'Erreur lors de la récupération', error: err2 });
      res.status(201).json(inserted[0]);
    });
  });
};

// Update entreprise
exports.updateEntreprise = (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const {
    contact_principal_id, user_id, commercial_id, secteur_id,
    nom, logo, siren, adresse, created, modified,
    telephone_standard, telephone_fax, siteweb,
    fct_adresse, fct_nom, has_participated, activity
  } = req.body;
  
  const updateQuery = `
    UPDATE entreprises SET
      contact_principal_id = ?, user_id = ?, commercial_id = ?, secteur_id = ?,
      nom = ?, logo = ?, siren = ?, adresse = ?, created = ?, modified = ?,
      telephone_standard = ?, telephone_fax = ?, siteweb = ?,
      fct_adresse = ?, fct_nom = ?, has_participated = ?, activity = ?
    WHERE id = ?
  `;
  
  const values = [
    contact_principal_id, user_id, commercial_id, secteur_id,
    nom, logo, siren, adresse, created, modified,
    telephone_standard, telephone_fax, siteweb,
    fct_adresse, fct_nom, has_participated, activity,
    req.params.id
  ];
  
  db.query(updateQuery, values, (err, result) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });
    res.json({ message: 'Entreprise mise à jour', affectedRows: result.affectedRows });
  });
  
};

// Delete entreprise
exports.deleteEntreprise = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM entreprises WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });
    res.json({ message: 'Entreprise supprimée', affectedRows: result.affectedRows });
  });
};
exports._getEntrepriseByUserId = _getEntrepriseByUserId;
