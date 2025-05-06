const db = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const {sendEmail} = require("../utils/email");
const entrepriseController = require('./entrepriseController');


exports.register = async (req, res) => {
  const { email, password, first_name, last_name } = req.body;

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Format email invalide" });
  }

  db.query("SELECT * FROM users WHERE email = ? AND verified = 1", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) return res.status(400).json({ error: "Email existant" });

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error: "Mot de passe requis (min 6 caractères, un symbole, un caractère majuscule, un caractère miniscule)",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1d" });

    db.query(
      "INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)",
      [email, hashedPassword, first_name, last_name],
      (err, result) => {
        if (err) return res.status(500).json({ error: err });

        // Send verification email
        sendEmail(
          "ne-pas-repondre@forumestp.fr",
          email,
          `${first_name} ${last_name}`,
          "Email Verification",
          `
          Bonjour haneso4638@harinv.com,

          Suite à votre inscription sur le site du ForumESTP, nous avons besoin de vérifier votre adresse e-mail.
          Pour ce faire, il suffit de suivre ce lien dans les 24 heures : <a href='${process.env.FRONT_BASE_URL}/auth/verify/${token}'>Cliquez ici pour vérifier votr eemail</a>
          Si le lien ne fonctionne pas correctement, veuillez copier le lien suivant dans votre navigateur :
          ${process.env.FRONT_BASE_URL}/auth/verify/${token}

          Merci par avance et à très bientôt,
          L'équipe du Forum ESTP 2025 `
        );

        // Return the new user info (without password)
        const newUser = {
          id: result.insertId,
          email,
          first_name,
          last_name,
          verified: false
        };

        res.status(201).json({ message: "Un email d'activation a été envoyé à votre compte, merci de l'activer.", user: newUser });
      }
    );
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
    sendEmail("ne-pas-repondre@forumestp.fr", results[0].email,results[0].first_name + " " + results[0].last_name , "Demande de rénitialisation de mot de passe", 
      `<a href='${process.env.FRONT_BASE_URL}/auth/validate-password/${resetToken}'>Click here to reset your password</a>`
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
  const { email, password, rememberMe} = req.body;
  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err || results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
      return res.status(401).json({ error: "Mot de passe ou email incorrecte" });
    }
    if (!results[0].verified) {
      return res.status(403).json({ error: "Email non vérifier" });
    }
    const entreprise = await entrepriseController._getEntrepriseByUserId(results[0].id);
    const token = jwt.sign({ userId: results[0].id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.cookie('user_id', results[0].id, {
      httpOnly: false,
      secure:  false,
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000
    });
    res.cookie('entreprise_id', entreprise.id, {
      httpOnly: false,
      secure:  false,
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000
    });
    res.cookie('contact_principal_id', entreprise.contact_principal_id, {
      httpOnly: false,
      secure:  false,
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000
    });
    res.cookie('token', token, {
      httpOnly: false,
      secure:  false,
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000
    });
    res.cookie('first_name', results[0].first_name, {
      httpOnly: false,
      secure:  false,
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000
    });
    res.cookie('last_name', results[0].last_name, {
      httpOnly: false,
      secure:  false,
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000
    });
    res.cookie('step', results[0].step, {
      httpOnly: false,
      secure:  false,
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000
    });
    if(rememberMe){
      res.cookie('email', results[0].email, {
        httpOnly: false,
        secure:  false,
        sameSite: 'Lax',
        maxAge: 24 * 60 * 60 * 1000
      });
      res.cookie('password', password, {
        httpOnly: false,
        secure:  false,
        sameSite: 'Lax',
        maxAge: 24 * 60 * 60 * 1000
      });
    }
    res.json({ message: "Login successful" , user: results[0]});
  });
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};
