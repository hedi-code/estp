const db = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');

// Get user by ID
exports.getUserById = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM users WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(result[0]);
  });
};
// Get all users
exports.getAllUsers = (req, res) => {
  db.query('SELECT * FROM users', (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};

// Get all users where role = 'comm'
exports.getCommercials = (req, res) => {
  db.query('SELECT * FROM users WHERE role = ? OR role = ?', ['rescom','comm'], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: 'No commercial users found' });
    res.json(result);
  });
};

// Get all members (users with role different than 'user')
exports.getMembers = (req, res) => {
  db.query(
    "SELECT id, email, first_name, last_name, role, created, modified, last_login, step, verified FROM users WHERE role IS NOT NULL AND role <> 'user' ORDER BY created DESC",
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    }
  );
};

// Update a member (first_name, last_name, email, role)
exports.updateMember = (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, role } = req.body;

  if (!first_name || !last_name || !email || !role) {
    return res.status(400).json({ error: "Tous les champs sont requis (prénom, nom, email, rôle)" });
  }

  const emailRegex = /^(?!.*@estp).*^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Format email invalide" });
  }

  if (role === 'user') {
    return res.status(400).json({ error: "Le rôle 'user' n'est pas autorisé pour un membre" });
  }

  db.query('SELECT id FROM users WHERE email = ? AND id <> ?', [email, id], (err, existing) => {
    if (err) return res.status(500).json({ error: err.message });
    if (existing.length > 0) return res.status(400).json({ error: "Cet email est déjà utilisé" });

    const modified = new Date();
    db.query(
      'UPDATE users SET first_name = ?, last_name = ?, email = ?, role = ?, modified = ? WHERE id = ?',
      [first_name, last_name, email, role, modified, id],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Utilisateur introuvable' });
        res.json({ message: 'Membre mis à jour avec succès', affectedRows: result.affectedRows });
      }
    );
  });
};

// Reset member password (president action — no old password required)
exports.resetMemberPassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ error: "Nouveau mot de passe requis" });
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      error: "Mot de passe requis (min 8 caractères, un symbole, une majuscule, une minuscule, un chiffre)",
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const modified = new Date();

  db.query(
    'UPDATE users SET password = ?, modified = ? WHERE id = ?',
    [hashedPassword, modified, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Utilisateur introuvable' });
      res.json({ message: 'Mot de passe réinitialisé avec succès' });
    }
  );
};

// Create new user
exports.createUser = async (req, res) => {
  const { email, password, first_name, last_name, role, step = 0, verified = 1 } = req.body;
  const created = new Date();
  const modified = new Date();
 const emailRegex = /^(?!.*@estp).*^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Format email invalide" });
  }
   const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error: "Mot de passe requis (min 6 caractères, un symbole, un caractère majuscule, un caractère miniscule)",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1d" });
  db.query(
    'INSERT INTO users (email, password, first_name, last_name, role, created, modified, step, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [email, hashedPassword, first_name, last_name, role, created, modified, step, verified],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Membre créer', id: result.insertId });
    }
  );
};

// Update the 'step' column only
exports.updateStep = (req, res) => {
  const { id } = req.params;
  const { step } = req.body;

  if (typeof step !== 'number') {
    return res.status(400).json({ message: 'Step must be a number' });
  }

  const modified = new Date();

  db.query(
    'UPDATE users SET step = ?, modified = ? WHERE id = ?',
    [step, modified, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
      res.json({ nonDisplayMessage: 'Step updated successfully', affectedRows: result.affectedRows });
    }
  );
};

// Change password (only for non-user roles)
exports.changePassword = async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: "Ancien et nouveau mot de passe requis" });
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/;
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      error: "Le nouveau mot de passe est trop faible (10 caractères, majuscule, minuscule, chiffre, symbole)",
    });
  }

  db.query('SELECT * FROM users WHERE id = ?', [id], async (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ error: 'Utilisateur introuvable' });

    const user = result[0];
    if (user.role === 'user') {
      return res.status(403).json({ error: "Les utilisateurs standards ne peuvent pas changer le mot de passe directement." });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(401).json({ error: "Ancien mot de passe incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const modified = new Date();

    db.query('UPDATE users SET password = ?, modified = ? WHERE id = ?', [hashedPassword, modified, id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Mot de passe mis à jour avec succès" });
    });
  });
};

exports.deleteUser = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });
    res.json({ nonDisplayMessage: 'Utilisateur supprimée', affectedRows: result.affectedRows });
  });
};
