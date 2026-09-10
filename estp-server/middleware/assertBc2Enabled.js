// Verrou serveur de la souscription BC2.
// - Si config.bc2_enable === '1' : tout le monde passe.
// - Sinon : seules les entreprises (role 'user') sont bloquées (403).
//   Les comptes admin (président, trésorier, commercial, etc.) gardent
//   l'accès pour gérer les BC2 déjà existants.
const db = require("../config/db");

module.exports = (req, res, next) => {
  db.query(
    "SELECT config_value FROM config WHERE config_name = 'bc2_enable'",
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Erreur base de données" });

      const enabled = rows && rows[0] && String(rows[0].config_value) === "1";
      if (enabled) return next();

      // BC2 verrouillé : on laisse passer les admins, on bloque les entreprises.
      db.query(
        "SELECT role FROM users WHERE id = ?",
        [req.userId],
        (err2, urows) => {
          if (err2) return res.status(500).json({ error: "Erreur base de données" });
          const role = urows && urows[0] ? urows[0].role : null;
          if (role && role !== "user") return next();
          return res
            .status(403)
            .json({ error: "La souscription au Bon de Commande 2 est actuellement fermée." });
        }
      );
    }
  );
};
