const db = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const { sendEmail } = require("../utils/email");
const entrepriseController = require('./entrepriseController');

// Construit le HTML de l'email d'activation.
function buildActivationEmailHtml(first_name, last_name, token) {
  const link = `${process.env.FRONT_BASE_URL}/auth/verify/${token}`;
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      background-color: #f6f6f6;
      padding: 20px;
      color: #333;
    }
    .email-container {
      background-color: #ffffff;
      padding: 30px;
      border-radius: 8px;
      max-width: 600px;
      margin: auto;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    a.button {
      display: inline-block;
      padding: 10px 20px;
      background-color: #005baa;
      color: #fff;
      text-decoration: none;
      border-radius: 4px;
      margin-top: 20px;
    }
    .footer {
      margin-top: 40px;
      font-size: 0.9em;
      color: #888;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <p>Bonjour <strong>${first_name} ${last_name}</strong>,</p>

    <p>Suite à votre inscription sur le site du <strong>Forum ESTP</strong>, nous avons besoin de vérifier votre adresse e-mail.</p>

    <p>Pour ce faire, il vous suffit de cliquer sur le bouton ci-dessous dans les prochaines 24 heures :</p>
    <a href="${link}" class="button">Vérifier mon adresse e-mail</a>
    <br>
    <p>Si le bouton ne fonctionne pas, copiez et collez le lien suivant dans votre navigateur :</p>
    <p><a href="${link}">${link}</a></p>
    <br>
    <p>Si vous ne recevez pas nos emails, pensez à vérifier votre dossier <strong>spam / courrier indésirable</strong>.</p>
    <p>Merci par avance et à très bientôt,</p>
    <p>L'équipe du Forum ESTP</p><br>

    <div class="footer">
      © 2026 Forum ESTP — Tous droits réservés.
    </div>
  </div>
</body>
</html>
`;
}

// Génère un token d'activation (24h) et envoie l'email. Lève une erreur si l'envoi échoue.
async function sendActivationEmail(email, first_name, last_name) {
  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1d" });
  await sendEmail(
    "ne-pas-repondre@forumestp.fr",
    email,
    `${first_name} ${last_name}`,
    "Vérification d'email — Forum ESTP",
    buildActivationEmailHtml(first_name, last_name, token)
  );
}

exports.register = async (req, res) => {
  const { email, password, first_name, last_name, verified } = req.body;
  const verificationCompte = verified ? 1 : 0;
  const emailRegex = /^(?!.*@forumestp)[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Format email invalide" });
  }

  db.query("SELECT * FROM users WHERE email = ? AND verified = 1", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) return res.status(400).json({ error: "Un compte existe déjà pour cet email." });

    db.query("SELECT * FROM users WHERE email = ? AND verified = 0", [email], async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length > 0) {
        // Compte créé mais jamais activé : au lieu de bloquer, on propose le renvoi de l'email.
        return res.status(409).json({
          error: "Un compte existe déjà pour cet email mais n'a pas encore été activé.",
          canResend: true,
          email,
        });
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          error: "Mot de passe invalide (au moins 8 caractères, dont une majuscule, une minuscule, un chiffre et un symbole).",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      db.query(
        "INSERT INTO users (email, password, first_name, last_name, verified) VALUES (?, ?, ?, ?, ?)",
        [email, hashedPassword, first_name, last_name, verificationCompte],
        async (err, result) => {
          if (err) return res.status(500).json({ error: err });

          const newUser = {
            id: result.insertId,
            email,
            first_name,
            last_name,
            verified: !!verified,
          };

          // Compte déjà vérifié (création par un admin) : pas d'email à envoyer.
          if (verified) {
            return res.status(201).json({ message: "Création réussie", user: newUser });
          }

          // Envoi de l'email d'activation AVANT de répondre "succès".
          try {
            await sendActivationEmail(email, first_name, last_name);
          } catch (mailErr) {
            console.error("Échec envoi email d'activation:", mailErr);
            // On annule la création pour ne pas laisser l'utilisateur dans une impasse
            // (ni connexion possible, ni réinscription). Il pourra réessayer.
            db.query("DELETE FROM users WHERE id = ? AND verified = 0", [result.insertId], () => {});
            return res.status(502).json({
              error: "Votre compte n'a pas pu être créé : l'email d'activation n'a pas pu être envoyé (service d'envoi momentanément indisponible). Merci de réessayer dans quelques minutes.",
            });
          }

          return res.status(201).json({
            message: "Un email d'activation a été envoyé à votre adresse. Merci de l'activer (pensez à vérifier vos spams).",
            user: newUser,
          });
        }
      );
    });
  });
};

// Renvoie un email d'activation pour un compte existant non vérifié.
exports.resendActivation = (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email requis" });

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });

    if (results.length === 0) {
      // Réponse générique : on n'indique pas si l'email existe ou non.
      return res.json({ message: "Si un compte non activé existe pour cet email, un nouvel email d'activation vient d'être envoyé." });
    }

    const user = results[0];
    if (user.verified) {
      return res.status(400).json({ error: "Ce compte est déjà activé, vous pouvez vous connecter." });
    }

    try {
      await sendActivationEmail(user.email, user.first_name, user.last_name);
    } catch (mailErr) {
      console.error("Échec renvoi email d'activation:", mailErr);
      return res.status(502).json({ error: "Impossible d'envoyer l'email pour le moment (service momentanément indisponible). Réessayez plus tard." });
    }

    return res.json({ message: "Un nouvel email d'activation a été envoyé (pensez à vérifier vos spams)." });
  });
};


exports.verifyEmail = (req, res) => {
  jwt.verify(req.params.token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(400).json({ error: "Invalid or expired token" });

    db.query("UPDATE users SET verified = 1 WHERE email = ?", [decoded.email], (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Merci d'avoir vérifier votre email, veuillez se connecter." });
    });
  });
};

exports.resetPasswordRequest = (req, res) => {
  const { email } = req.body;

  // Check if the email exists in the database
  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });
    if (results.length === 0) return res.status(404).json({ error: "Email non existant" });
    // Generate reset token (expires in 1 hour)
    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Send reset password email
    sendEmail("ne-pas-repondre@forumestp.fr", results[0].email, results[0].first_name + " " + results[0].last_name, "Demande de rénitialisation de mot de passe",
      `<a href='${process.env.FRONT_BASE_URL}/auth/validate-password/${resetToken}'>Cliquez ici pour réinitialiser votre mot de passe</a>`
    );
    res.json({ message: "Votre demande de rénitialisation a été envoyer à votre email" });
  });
};

exports.resetPassword = (req, res) => {
  const { newPassword } = req.body;
  const token = req.params.token;

  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  // Verify reset token
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(400).json({ error: "Invalid or expired token" });

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in the database
    db.query("UPDATE users SET password = ? WHERE email = ?", [hashedPassword, decoded.email], (err) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ message: "Mot de passe modifié" });
    });
  });
};

exports.login = (req, res) => {
  const { email, password, rememberMe } = req.body;
  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err || results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
      return res.status(401).json({ error: "Mot de passe ou email incorrecte" });
    }
    if (!results[0].verified) {
      return res.status(403).json({ error: "Email non vérifier" });
    }
    const entreprise = await entrepriseController._getEntrepriseByUserId(results[0].id);
    const token = jwt.sign({ userId: results[0].id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    if(entreprise){
       res.cookie('entreprise_id', entreprise.id, {
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000
    });
    res.cookie('contact_principal_id', entreprise.contact_principal_id, {
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000
    });
     res.cookie('step', results[0].step, {
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000
    });
    }
    res.cookie('user_id', results[0].id, {
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000
    });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000
    });
    res.cookie('first_name', results[0].first_name, {
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000
    });
    res.cookie('last_name', results[0].last_name, {
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000
    });
      res.cookie('role', results[0].role, {
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
        maxAge: 24 * 60 * 60 * 1000
      });
    if (rememberMe) {
      res.cookie('email', results[0].email, {
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
        maxAge: 24 * 60 * 60 * 1000
      });
      res.cookie('password', password, {
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
        maxAge: 24 * 60 * 60 * 1000
      });
    }
    const { password: _pw, ...safeUser } = results[0];
    res.json({ nonDisplayMessage: "Login successful", user: safeUser });
  });
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};
