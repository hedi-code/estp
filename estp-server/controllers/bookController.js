const db = require('../config/db');

// Get all books
exports.getAllBooks = (req, res) => {
  db.query('SELECT * FROM book', (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });
    res.json(results);
  });
};

// Get book by ID
exports.getBookById = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM book WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Book non trouvé' });
    res.json(results[0]);
  });
};

// Get book by ID
exports.getBookByEntrepriseId = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM book WHERE entreprise_id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Book non trouvé' });
    res.json(results[0]);
  });
};

// Internal helper
async function _getBookByUserId(id) {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM book WHERE user_id = ?', [id], (err, results) => {
      if (err) return reject(err);
      if (results.length === 0) return resolve(null);
      resolve(results[0]);
    });
  });
}
exports.getBookByUserId = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM book WHERE user_id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Book non trouvé' });
    res.json(results[0]);
  });
};

// Create new book
exports.createBook = (req, res) => {
  const {
    entreprise_id,
    description, nombre_collaborateurs, implantation,
    activite, slogan, site_web,
    logo_url, valide_forum, valide_entreprise, chiffreAff
  } = req.body;

  const now = new Date();

  // Vérifier s'il existe déjà un book pour cette entreprise
  const checkQuery = 'SELECT id FROM book WHERE entreprise_id = ? LIMIT 1';
  db.query(checkQuery, [entreprise_id], (checkErr, results) => {
    if (checkErr) {
      return res.status(500).json({ message: 'Erreur serveur', error: checkErr });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: 'Un book existe déjà pour votre entreprise.' });
    }

    // Si pas de doublon, procéder à l'insertion
    const insertQuery = `
      INSERT INTO book (
        entreprise_id, description, nombre_collaborateurs, implantation,
        activite, slogan, site_web,
        logo_url, valide_forum, valide_entreprise, created_at, updated_at, chiffreAff
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      entreprise_id, description, nombre_collaborateurs, implantation,
      activite, slogan, site_web,
      logo_url, !!valide_forum, !!valide_entreprise, now, now, chiffreAff
    ];

    db.query(insertQuery, values, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la création du book', error: err });
      }

      const insertedId = result.insertId;
      db.query('SELECT * FROM book WHERE id = ?', [insertedId], (err2, inserted) => {
        if (err2) {
          return res.status(500).json({ message: 'Erreur lors de la récupération', error: err2 });
        }

        res.status(201).json({ message: 'Book enregistré', book: inserted[0] });
      });
    });
  });
};


// Update book
exports.updateBook = (req, res) => {
  const { id } = req.params;
  const {
    entreprise_id,
    description, nombre_collaborateurs, implantation,
    activite, slogan, site_web,
    logo_url, valide_forum, valide_entreprise, chiffreAff
  } = req.body;

  const now = new Date();

  const updateQuery = `
    UPDATE book SET
      entreprise_id = ?, description = ?, nombre_collaborateurs = ?, implantation = ?,
      activite = ?, slogan = ?, site_web = ?,
      logo_url = ?, valide_forum = ?, valide_entreprise = ?, updated_at = ?, chiffreAff = ?
    WHERE id = ?
  `;

  const values = [
    entreprise_id, description, nombre_collaborateurs, implantation,
    activite, slogan, site_web,
    logo_url, !!valide_forum, !!valide_entreprise, now, chiffreAff, id 
  ];

  db.query(updateQuery, values, (err, result) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });
    res.json({ message: 'Book mis à jour', affectedRows: result.affectedRows });
  });
};

// Delete book
exports.deleteBook = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM book WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });
    res.json({ message: 'Book supprimé', affectedRows: result.affectedRows });
  });
};

exports._getBookByUserId = _getBookByUserId;
