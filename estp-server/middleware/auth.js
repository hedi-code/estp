const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
  // Token accepté via l'en-tête Authorization OU le cookie httpOnly `token`.
  const headerToken = req.headers.authorization?.split(" ")[1];
  const token = headerToken || req.cookies?.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.userId = decoded.userId;
    next();
  });
};