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
    nom, logo, siren, adresse,
    telephone_standard, telephone_fax, siteweb,
    fct_adresse, fct_nom, has_participated, activity
  } = req.body;

  const now = new Date();

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
    nom, logo, siren, adresse, now, now,
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
  const {
    contact_principal_id, user_id, commercial_id, secteur_id,
    nom, logo, siren, adresse,
    telephone_standard, telephone_fax, siteweb,
    fct_adresse, fct_nom, has_participated, activity
  } = req.body;

  const now = new Date(); // Today's date for modified

  const updateQuery = `
    UPDATE entreprises SET
      contact_principal_id = ?, user_id = ?, commercial_id = ?, secteur_id = ?,
      nom = ?, logo = ?, siren = ?, adresse = ?, modified = ?,
      telephone_standard = ?, telephone_fax = ?, siteweb = ?,
      fct_adresse = ?, fct_nom = ?, has_participated = ?, activity = ?
    WHERE id = ?
  `;

  const values = [
    contact_principal_id, user_id, commercial_id, secteur_id,
    nom, logo, siren, adresse, now,
    telephone_standard, telephone_fax, siteweb,
    fct_adresse, fct_nom, has_participated, activity,
    id
  ];

  db.query(updateQuery, values, (err, result) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });
    res.json({ nonDisplayMessage: 'Entreprise mise à jour', affectedRows: result.affectedRows });
  });
};


// Delete entreprise
exports.deleteEntreprise = (req, res) => {
  const { id } = req.params;

  // First get entreprise to know which user_id is linked
  db.query('SELECT user_id FROM entreprises WHERE id = ?', [id], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });
    if (rows.length === 0) return res.status(404).json({ message: 'Entreprise non trouvée' });

    const userId = rows[0].user_id;

    // Delete the linked user
    db.query('DELETE FROM users WHERE id = ?', [userId], (err, userResult) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });

      // Then delete the entreprise
      db.query('DELETE FROM entreprises WHERE id = ?', [id], (err, entrepriseResult) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });

        res.json({
          message: 'Entreprise supprimée',
          deletedEntreprise: entrepriseResult.affectedRows
        });
      });
    });
  });
};


// Get all entreprises with pack1s and place_plan
exports.getEntreprisesWithPack1s = (req, res) => {
  const query = `
    SELECT
      e.id,
      e.nom,
      e.siren,
      e.adresse,
      e.place_plan,
      e.user_id,
      c1.id as commande1_id,
      c1.pack1_id,
      c1.total_ht,
      c1.valide,
      p1.id as pack_id,
      p1.titre as pack1_titre,
      p1.description as pack1_description,
      ps.id as surface_id,
      ps.surface,
      ps.prix as surface_prix
    FROM entreprises e
    INNER JOIN commande1s c1 ON e.id = c1.entreprise_id
    INNER JOIN pack1s_surface ps ON c1.pack1_id = ps.id
    INNER JOIN pack1s p1 ON ps.id_pack1 = p1.id
    WHERE c1.pack1_id IS NOT NULL
    ORDER BY e.nom ASC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });
    res.json(results);
  });
};

// Update place_plan for an entreprise
exports.updatePlacePlan = (req, res) => {
  const { id } = req.params;
  const { place_plan } = req.body;

  const updateQuery = `
    UPDATE entreprises SET place_plan = ?, modified = ?
    WHERE id = ?
  `;

  const now = new Date();
  const values = [place_plan, now, id];

  db.query(updateQuery, values, (err, result) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });
    res.json({ message: 'Place plan mise à jour', affectedRows: result.affectedRows });
  });
};

exports._getEntrepriseByUserId = _getEntrepriseByUserId;
