const db = require("../config/db");

// À utiliser APRÈS le middleware `auth` (qui renseigne req.userId).
// Autorise tout membre du staff (tout rôle SAUF 'user' = compte entreprise).
// Empêche un compte entreprise d'appeler les endpoints d'administration.
module.exports = (req, res, next) => {
  if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
  db.query("SELECT role FROM users WHERE id = ?", [req.userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(401).json({ error: "Unauthorized" });
    const role = results[0].role;
    if (!role || role === "user") {
      return res.status(403).json({ error: "Accès réservé au personnel du Forum." });
    }
    req.userRole = role;
    next();
  });
};
