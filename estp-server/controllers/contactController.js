const db = require("../config/db");

// CREATE contact
exports.createContact = (req, res) => {
    const {
      user_id, entreprise_id, nom, prenom, email,
      telephone1, telephone2, telephone_fax,
      newsletter, fonction, standiste, genre
    } = req.body;
  
    const created = new Date();
    const modified = new Date();
  
    const insertSql = `
      INSERT INTO contacts (
        user_id, entreprise_id, nom, prenom, email,
        telephone1, telephone2, telephone_fax,
        newsletter, fonction, standiste, genre,
        created, modified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
  
    const values = [
      user_id, entreprise_id, nom, prenom, email,
      telephone1, telephone2, telephone_fax,
      newsletter, fonction, standiste, genre,
      created, modified
    ];
  
    db.query(insertSql, values, (err, result) => {
      if (err) return res.status(500).json({ error: err });
  
      const insertedId = result.insertId;
      db.query('SELECT * FROM contacts WHERE id = ?', [insertedId], (err2, rows) => {
        if (err2) return res.status(500).json({ error: err2 });
        res.status(201).json(rows[0]);
      });
    });
  };
  

// READ all contacts
exports.getAllContacts = (req, res) => {
  db.query('SELECT * FROM contacts', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json(results);
  });
};

// READ one contact
exports.getContactById = (req, res) => {
  const { id } = req.params;

  db.query('SELECT * FROM contacts WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Contact not found' });
    res.status(200).json(results[0]);
  });
};
exports.getContactByUserId = (req, res) => {
  const { id } = req.params;

  db.query('SELECT * FROM contacts WHERE user_id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Contact not found' });
    res.status(200).json(results);
  });
};
exports.getContactByEntrepriseId = (req, res) => {
  const { id } = req.params;

  db.query('SELECT * FROM contacts WHERE user_id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Contact not found' });
    res.status(200).json(results);
  });
};

// UPDATE contact
exports.updateContact = (req, res) => {
  const { id } = req.params;
  const {
    user_id, entreprise_id, nom, prenom, email,
    telephone1, telephone2, telephone_fax,
    newsletter, fonction, standiste, genre
  } = req.body;

  const modified = new Date();

  const sql = `
    UPDATE contacts SET
      user_id = ?, entreprise_id = ?, nom = ?, prenom = ?, email = ?,
      telephone1 = ?, telephone2 = ?, telephone_fax = ?,
      newsletter = ?, fonction = ?, standiste = ?, genre = ?,
      modified = ?
    WHERE id = ?
  `;

  const values = [
    user_id, entreprise_id, nom, prenom, email,
    telephone1, telephone2, telephone_fax,
    newsletter, fonction, standiste, genre,
    modified, id
  ];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Contact not found' });
    res.status(200).json({ message: 'Contacts mis à jour' });
  });
};

// DELETE contact
exports.deleteContact = (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM contacts WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Contact not found' });
    res.status(200).json({ message: 'Contact deleted' });
  });
};
