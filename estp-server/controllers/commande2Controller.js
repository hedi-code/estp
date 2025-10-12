// controllers/commande2Controller.js

const db = require("../config/db");
const { sendEmail } = require("../utils/email");
const fs = require('fs');
const path = require('path');
function waitForFile(filePath, timeout = 10000, interval = 500) {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    const check = () => {
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (!err) return resolve();
        if (Date.now() - start >= timeout) return reject(new Error("Fichier PDF non généré à temps"));
        setTimeout(check, interval);
      });
    };

    check();
  });
}
exports.createCommande2 = (req, res) => {
  const {
    entreprise_id,
    pack2_id,
    pack2_color,
    reduc_pct = 0.00,
    remise_pack_plus,
    total_ht_avt_remise,
    total_ht,
    standiste_nom,
    standiste_prenom,
    standiste_entreprise,
    standiste_telephone,
    standiste_demande,
    standiste_status,
    validation_lieu,
    valide = 0,
    fct_payee = 0,
    fct_envoyee = 0
  } = req.body;

  const now = new Date();

  db.query(
    `SELECT * FROM commande2s WHERE entreprise_id = ?`,
    [entreprise_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Erreur base de données" });
      if (result.length > 0) {
        return res.status(400).json({ error: "Un bon de commande 2 existe déjà pour cette entreprise." });
      }

      db.query(
        `INSERT INTO commande2s (entreprise_id, pack2_id, pack2_color, reduc_pct, remise_pack_plus, valide, total_ht_avt_remise, total_ht, created, modified, standiste_nom, standiste_prenom, standiste_entreprise, standiste_telephone, standiste_demande, standiste_status, validation_lieu, fct_payee, fct_envoyee)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          entreprise_id,
          pack2_id,
          pack2_color,
          reduc_pct,
          remise_pack_plus,
          valide,
          total_ht_avt_remise,
          total_ht,
          now,
          now,
          standiste_nom,
          standiste_prenom,
          standiste_entreprise,
          standiste_telephone,
          standiste_demande,
          standiste_status,
          validation_lieu,
          fct_payee,
          fct_envoyee
        ],
        (err, result) => {
          if (err) return res.status(500).json({ error: "Erreur base de données" });
          res.status(201).json({ message: "Commande 2 créée avec succès", id: result.insertId });
            db.query(`SELECT u.*, e.nom as nomEntreprise FROM users u, entreprises e WHERE u.id = e.user_id AND e.id = ?`, [entreprise_id],
            async (err, result) => {
              if (result.length > 0) {
                const attachmentPath = path.join(__dirname, '../uploads/bc2/', `${entreprise_id}_BC2.pdf`);
                try {
                  await waitForFile(attachmentPath, 20000);
                  const attachmentBuffer = fs.readFileSync(attachmentPath);
                  const base64Attachment = attachmentBuffer.toString('base64');
                  const htmlContent =
                    "<style>" +
                    "p { color: black !important; }" +
                    "</style>" +
"<p>Bonjour,</p>"+
"<p>Félicitations, votre bon de commande 2 pour la 46ème édition du Forum ESTP est validé. Nous avons hâte de vous recevoir.</p>"+
"<p>Vous trouverez ci-joint votre bon de commande 2.<br />La facture associée vous sera bientôt transmise. Pour toute demande concernant la facture, contactez Kahina Saibi sur l’adresse mail suivante : <a href='mailto:kahina.saibi@forumestp.fr'>kahina.saibi@forumestp.fr</a>.</p>"+
"<p>Vous pouvez dès maintenant enregistrer vos exposants directement dans la rubrique \"récapitulatifs\". Après le 19 Novembre, il ne sera plus possible d’en ajouter.</p>"+
"<p>Vous pouvez aussi y consulter votre BC1, BC2 et les informations clefs de l’organisation du Forum.</p>"+
"<p>Si vous avez des questions sur l'organisation le jour J, n'hésitez pas à contacter votre commercial référent.</p>"+
"<p>Bien cordialement,</p>"+
                    "<img src=\"https://test.app.forumestp.fr/assets/logo.png\" alt=\"\" style=\"max-width: 300px; max-height: 200px;\" />" +
                    "<p>28 avenue du Président Wilson <br />94234 CACHAN Cedex </p>" +
                    "<p>Notre site WEB : <a href=\"https://www.forumetp.org\">Forum ESTP</a></p>";
                  sendEmail("ne-pas-repondre@forumestp.fr", result[0].email , result[0].first_name + " " + result[0].last_name, "Forum ESTP : Bon de commande 2", htmlContent, ["alice.douard@forumestp.fr"], `${entreprise_id}_BC2.pdf`, base64Attachment);
                } catch (err) {
                  console.error("Erreur en attente du PDF avant l'envoi de l'email :", err);
                }
              }
            }
          );
        }
      );
    }
  );
};

exports.getCommande2ById = (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM commande2s WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });
    if (result.length === 0) return res.status(404).json({ error: "Commande non trouvée" });
    res.json(result[0]);
  });
};

exports.getCommande2ByEntrepriseId = (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM commande2s WHERE entreprise_id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });
    res.json(result[0]);
  });
};

exports.updateCommande2 = (req, res) => {
  const id = req.params.id;
  const {
    pack2_id,
    pack2_color,
    reduc_pct,
    remise_pack_plus,
    total_ht_avt_remise,
    total_ht,
    standiste_nom,
    standiste_prenom,
    standiste_entreprise,
    standiste_telephone,
    standiste_demande,
    standiste_status,
    validation_lieu,
    valide,
    fct_payee = 0,
    fct_envoyee = 0
  } = req.body;

  const modified = new Date();

  db.query(
    `UPDATE commande2s
     SET pack2_id = ?, pack2_color = ?, reduc_pct = ?, remise_pack_plus = ?, total_ht_avt_remise = ?, total_ht = ?, modified = ?, standiste_nom = ?, standiste_prenom = ?, standiste_entreprise = ?, standiste_telephone = ?, standiste_demande = ?, standiste_status = ?, validation_lieu = ?, valide = ?, fct_payee = ?, fct_envoyee = ?
     WHERE id = ?`,
    [
      pack2_id,
      pack2_color,
      reduc_pct,
      remise_pack_plus,
      total_ht_avt_remise,
      total_ht,
      modified,
      standiste_nom,
      standiste_prenom,
      standiste_entreprise,
      standiste_telephone,
      standiste_demande,
      standiste_status,
      validation_lieu,
      valide,
      fct_payee,
      fct_envoyee,
      id
    ],
    (err) => {
      if (err) return res.status(500).json({ error: "Erreur base de données" });
      res.json({ message: "Commande 2 mise à jour" });
    }
  );
};

exports.deleteCommande2 = (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM commande2s WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });
    res.json({ message: "Commande 2 supprimée" });
  });
};

exports.getAllCommande2s = (req, res) => {
  db.query("SELECT * FROM commande2s", (err, results) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });
    res.json(results);
  });
};

exports.getCommande2WithDetails = (req, res) => {
  const id = req.params.id;

  const query = `
    SELECT
      c2.*,
      p2.nom as pack_nom,
      p2.coloris as pack_coloris,
      p2.prix_ht as pack_prix_ht,
      e.nom as entreprise_nom
    FROM commande2s c2
    LEFT JOIN pack2s p2 ON c2.pack2_id = p2.id
    LEFT JOIN entreprises e ON c2.entreprise_id = e.id
    WHERE c2.id = ?
  `;

  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });
    if (result.length === 0) return res.status(404).json({ error: "Commande non trouvée" });
    res.json(result[0]);
  });
};

exports.setFactureEnvoyee = (req, res) => {
  const id = req.params.id;
  db.query(
    `UPDATE commande2s SET fct_envoyee = 1 WHERE id = ?`,
    [id],
    (err) => {
      if (err) return res.status(500).json({ error: "Erreur base de données" });
      res.json({ message: "Facture marquée comme envoyée" });
    }
  );
};

exports.setFacturePayee = (req, res) => {
  const id = req.params.id;
  db.query(
    `UPDATE commande2s SET fct_payee = 1 WHERE id = ?`,
    [id],
    (err) => {
      if (err) return res.status(500).json({ error: "Erreur base de données" });
      res.json({ message: "Facture marquée comme payée" });
    }
  );
};