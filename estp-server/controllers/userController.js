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
      res.status(201).json({ message: 'User created', id: result.insertId });
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
