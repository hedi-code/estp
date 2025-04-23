const db = require("../config/db");

// Get user by ID
exports.getUserById = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM users WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(result[0]);
  });
};

// Create new user
exports.createUser = (req, res) => {
  const { email, password, first_name, last_name, role, step = 0, verified = 0 } = req.body;
  const created = new Date();
  const modified = new Date();

  db.query(
    'INSERT INTO users (email, password, first_name, last_name, role, created, modified, step, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [email, password, first_name, last_name, role, created, modified, step, verified],
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
      res.json({ message: 'Step updated successfully', affectedRows: result.affectedRows });
    }
  );
};
