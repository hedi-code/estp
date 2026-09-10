const db = require("../config/db");

// À utiliser APRÈS le middleware `auth` (qui renseigne req.userId).
// Autorise uniquement le compte administrateur (rôle président).
module.exports = (req, res, next) => {
  if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
  db.query("SELECT role FROM users WHERE id = ?", [req.userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(401).json({ error: "Unauthorized" });
    if (results[0].role !== "pres") {
      return res.status(403).json({ error: "Accès réservé à l'administrateur." });
    }
    next();
  });
};
