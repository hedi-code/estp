const jwt = require("jsonwebtoken");

// Protège les fichiers sensibles servis statiquement (factures PDF).
// Le lien d'ouverture est une navigation <a target="_blank"> : impossible d'y
// mettre un header Authorization. On accepte donc le token depuis :
//   - le cookie `token` (envoyé automatiquement à la navigation),
//   - l'en-tête Authorization (clients API),
//   - le paramètre de requête ?token= (repli).
module.exports = (req, res, next) => {
  const headerToken = req.headers.authorization?.split(" ")[1];
  const token = headerToken || req.cookies?.token || req.query?.token;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    next();
  });
};
