// controllers/commande1Controller.js

const db = require("../config/db");
const { sendEmail } = require("../utils/email");
const fs = require('fs');
const path = require('path');


exports.createCommande1 = (req, res) => {
  const {
    entreprise_id,
    pack1_id,
    reduc_pct = 0.00,
    reduc_lin = 0.00,
    total_ht_avt_remise = 0.00,
    total_ht = 0.00,
    validation_lieu = null,
  } = req.body;

  const now = new Date();

  // Step 1: Check if a commande already exists for this entreprise_id
  db.query(
    `SELECT * FROM commande1s WHERE entreprise_id = ?`,
    [entreprise_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Erreur base de données" });

      // Step 2: If a commande already exists for this entreprise_id, return an error
      if (result.length > 0) {
        return res.status(400).json({ error: "Une commande existe déjà pour cette entreprise." });
      }

      // Step 3: If no commande exists, proceed to insert a new one
      db.query(
        `INSERT INTO commande1s (entreprise_id, pack1_id, reduc_pct, reduc_lin, total_ht_avt_remise, total_ht, created, modified, validation_lieu)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          entreprise_id,
          pack1_id,
          reduc_pct,
          reduc_lin,
          total_ht_avt_remise,
          total_ht,
          now,
          now,
          validation_lieu,
        ],
        (err, result) => {
          if (err) return res.status(500).json({ error: "Erreur base de données" });
          
          // Step 4: Respond with success message and the inserted id
          res.status(201).json({ message: "Commande créée avec succès", id: result.insertId });

          // After successful insertion, send the email (as before)
          db.query(`SELECT u.*, e.nom as nomEntreprise FROM users u, entreprises e WHERE u.id = e.user_id AND e.id = ?`, [entreprise_id], 
            (err, result) => {
              if (result.length > 0) {
                const attachmentPath = path.join(__dirname, '../uploads/bc1/', `${entreprise_id}_BC1.pdf`);
                const attachmentBuffer = fs.readFileSync(attachmentPath);
                const base64Attachment = attachmentBuffer.toString('base64');
                const htmlContent =
                  "<style>" +
                  "p { color: black !important; }" +
                  "</style>" +
                  "<p>Bonjour ,</p>" +
                  "<p>Félicitations, votre inscription à la 45ème édition du Forum ESTP est validée. <br /> Nous avons hâte de vous recevoir.</p>" +
                  "<p>Vous trouverez ci-joint votre bon de commande 1. <br /> La facture associée vous sera bientôt transmise.</p>" +
                  "<p>Vous pouvez maintenant compléter votre <b>page sur le Book du Forum</b>.</p>" +
                  "<p>Cet outil vous permet de présenter votre entreprise et de décrire ce que vous recherchez chez un futur collaborateur dans l’annuaire de l'évènement, support distribué à tous les visiteurs lors de leur passage au Forum.</p>" +
                  "<p>Vous bénéficiez d’une page dédiée pour présenter votre entreprise, expliquer en détail votre politique de recrutement et partager les secteurs porteurs pour le recrutement de nouveaux talents.</p>" +
                  "<p>Vous avez jusqu’au <b>7 octobre 2025</b> pour compléter ce formulaire.</p>" +
                  "<p>La campagne de personnalisation ouvrira à partir du 30 septembre 2025, sous la forme du Bon de Commande 2.</p>" +
                  "<p>Vous pourrez y réserver votre mobilier, votre électricité, vos places de parking… <br /> Tout ce qui permettra de rendre cette expérience inoubliable.</p>" +
                  "<p>Si vous rencontrez des difficultés pour remplir ce formulaire, veuillez contacter votre commercial référent.</p>" +
                  "<p>Bien cordialement,</p>" +
                  "<img src=\"https://staging.app.forumetp.fr/img/logo.png\" alt=\"\" style=\"max-width: 100%; max-height: 200px;\" />" +
                  "<p>28 avenue du Président Wilson <br />94234 CACHAN Cedex <br />Tél. : +33 9 51 23 97 76</p>" +
                  "<p>Notre site WEB : <a href=\"https://www.forumetp.org\">Forum ESTP</a></p>";
                sendEmail("ne-pas-repondre@forumestp.fr", result[0].email, result[0].first_name + " " + result[0].last_name, "Inscription à la 46ème édition du Forum ESTP", htmlContent, `${entreprise_id}_BC1.pdf`, base64Attachment);
                sendEmail("ne-pas-repondre@forumestp.fr", "kahina.saibi@forumestp.fr", "Kahina Saibi", "Inscription à la 46ème édition du Forum ESTP", "Bonjour,<br /><br />La société <b>" + result[0].nomEntreprise + "</b> vient d'enregistrer son BC1.<br />");
              }
            }
          );
        }
      );
    }
  );
};


exports.getCommande1ById = (req, res) => {
  const id = req.params.id;

  db.query("SELECT * FROM commande1s WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });
    if (result.length === 0) return res.status(404).json({ error: "Commande non trouvée" });
    res.json(result[0]);
  });
};

exports.updateCommande1 = (req, res) => {
  const id = req.params.id;
  const {
    pack1_id,
    reduc_pct,
    reduc_lin,
    total_ht_avt_remise,
    total_ht,
    validation_lieu,
    valide
  } = req.body;

  const modified = new Date();

  db.query(
    `UPDATE commande1s 
     SET pack1_id = ?, reduc_pct = ?, reduc_lin = ?, total_ht_avt_remise = ?, total_ht = ?, validation_lieu = ?, valide = ?, modified = ?
     WHERE id = ?`,
    [
      pack1_id,
      reduc_pct,
      reduc_lin,
      total_ht_avt_remise,
      total_ht,
      validation_lieu,
      valide,
      modified,
      id
    ],
    (err) => {
      if (err) return res.status(500).json({ error: "Erreur base de données" });
      res.json({ message: "Commande mise à jour" });
    }
  );
};

exports.deleteCommande1 = (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM commande1s WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });
    res.json({ message: "Commande supprimée" });
  });
};

exports.getAllCommande1s = (req, res) => {
  db.query("SELECT * FROM commande1s", (err, results) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });
    res.json(results);
  });
};
