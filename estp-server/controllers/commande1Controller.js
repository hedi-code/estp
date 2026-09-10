// controllers/commande1Controller.js

const db = require("../config/db");
const { sendEmail } = require("../utils/email");
const { loadForumConfig } = require("../utils/forumConfig");
const fs = require('fs');
const path = require('path');
const { syncBC1, markInvoicePaid, deleteAxonautInvoice } = require('../axonaut/axonautService');

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

exports.createCommande1 = (req, res) => {
  const {
    entreprise_id,
    pack1_id,
    reduc_pct = 0.00,
    reduc_lin = 0.00,
    total_ht_avt_remise = 0.00,
    total_ht = 0.00,
    validation_lieu = null,
    valide = 0,
    fct_payee = 0,
    fct_envoyee = 0,
    signature = null
  } = req.body;

  const now = new Date();

  db.query(
    `SELECT * FROM commande1s WHERE entreprise_id = ?`,
    [entreprise_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Erreur base de données" });
      if (result.length > 0) {
        return res.status(400).json({ error: "Un bon de commande existe déjà pour cette entreprise." });
      }

      db.query(
        `INSERT INTO commande1s (entreprise_id, pack1_id, reduc_pct, reduc_lin, total_ht_avt_remise, total_ht, created, modified, validation_lieu, valide, fct_payee, fct_envoyee, signature)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          valide,
          fct_payee,
          fct_envoyee,
          signature
        ],
        (err, result) => {
          if (err) return res.status(500).json({ error: "Erreur base de données" });
          res.status(201).json({ message: "Commande créée avec succès", id: result.insertId });

          // Sync to Axonaut (fire-and-forget)
          syncBC1(result.insertId).catch(e =>
            console.error(`[Axonaut] syncBC1 create #${result.insertId}:`, e.message)
          );

          db.query(`SELECT u.*, e.nom as nomEntreprise FROM users u, entreprises e WHERE u.id = e.user_id AND e.id = ?`, [entreprise_id],
            async (err, result) => {
              if (result.length > 0) {
                const attachmentPath = path.join(__dirname, '../uploads/bc1/', `${entreprise_id}_BC1.pdf`);
                try {
                  const cfg = await loadForumConfig();

                  // On attend le PDF jusqu'à 2 min (le navigateur du client le génère
                  // puis l'upload ; il finit toujours par arriver). S'il n'est vraiment
                  // pas là au bout de 2 min, on envoie quand même la confirmation, sans
                  // pièce jointe, pour ne jamais laisser l'entreprise sans email.
                  let base64Attachment = null;
                  let attachmentFileName = null;
                  try {
                    await waitForFile(attachmentPath, 120000);
                    base64Attachment = fs.readFileSync(attachmentPath).toString('base64');
                    attachmentFileName = `${entreprise_id}_BC1.pdf`;
                  } catch (waitErr) {
                    console.warn(`[BC1] PDF indisponible après 2 min pour entreprise ${entreprise_id}, envoi du mail sans pièce jointe :`, waitErr.message);
                  }

                  const htmlContent =
                    "<style>" +
                    "p { color: black !important; }" +
                    "</style>" +
                    "<p>Bonjour ,</p>" +
                    `<p>Félicitations, votre inscription à la ${cfg.editionLabel} du Forum ESTP est validée. <br /> Nous avons hâte de vous recevoir.</p>` +
                    (attachmentFileName
                      ? "<p>Vous trouverez ci-joint votre bon de commande 1. <br /> La facture associée vous sera bientôt transmise.</p>"
                      : "<p>Votre bon de commande 1 vous sera transmis dans un prochain email. <br /> La facture associée vous sera bientôt transmise.</p>") +
                    "<p>Vous pouvez maintenant compléter votre <b>page sur le Book du Forum</b>.</p>" +
                    "<p>Cet outil vous permet de présenter votre entreprise et de décrire ce que vous recherchez chez un futur collaborateur dans l’annuaire de l'évènement, support distribué à tous les visiteurs lors de leur passage au Forum.</p>" +
                    "<p>Vous bénéficiez d’une page dédiée pour présenter votre entreprise, expliquer en détail votre politique de recrutement et partager les secteurs porteurs pour le recrutement de nouveaux talents.</p>" +
                    `<p>Vous avez jusqu’au <b>${cfg.bookDeadline}</b> pour compléter ce formulaire.</p>` +
                    `<p>La campagne de personnalisation ouvrira à partir du ${cfg.bc2OpenDate}, sous la forme du Bon de Commande 2.</p>` +
                    "<p>Vous pourrez y réserver votre mobilier, votre électricité, vos places de parking… <br /> Tout ce qui permettra de rendre cette expérience inoubliable.</p>" +
                    "<p>Si vous rencontrez des difficultés pour remplir ce formulaire, veuillez contacter votre commercial référent.</p>" +
                    "<p>Bien cordialement,</p>" +
                    "<img src=\"https://app.forumetp.fr/assets/logo.png?v=47\" alt=\"Forum ESTP\" style=\"max-width: 100%; max-height: 200px;\" />" +
                    "<p>28 avenue du Président Wilson <br />94234 CACHAN Cedex <br />Tél. : +33 9 51 23 97 76</p>" +
                    "<p>Notre site WEB : <a href=\"https://www.forumetp.org\">Forum ESTP</a></p>";
                  await sendEmail("ne-pas-repondre@forumestp.fr", result[0].email, result[0].first_name + " " + result[0].last_name, `Inscription à la ${cfg.editionLabel} du Forum ESTP`, htmlContent, ["forumetp@gmail.com"], attachmentFileName, base64Attachment);
                } catch (err) {
                  console.error("Erreur lors de l'envoi de l'email de confirmation BC1 :", err);
                }
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

exports.getCommande1ByEntrepriseId = (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM commande1s WHERE entreprise_id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });
    //if (result.length === 0) return res.status(404).json({ error: "Commande non trouvée" });
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
    valide,
    fct_payee = 0,
    fct_envoyee = 0
  } = req.body;

  const modified = new Date();

  // First, get the current pack1_id and entreprise_id
  db.query(
    `SELECT pack1_id, entreprise_id FROM commande1s WHERE id = ?`,
    [id],
    (err, currentResult) => {
      if (err) return res.status(500).json({ error: "Erreur base de données" });
      if (currentResult.length === 0) return res.status(404).json({ error: "Commande non trouvée" });

      const oldPack1Id = currentResult[0].pack1_id;
      const entrepriseId = currentResult[0].entreprise_id;
      const pack1Changed = oldPack1Id !== pack1_id;

      db.query(
        `UPDATE commande1s
         SET pack1_id = ?, reduc_pct = ?, reduc_lin = ?, total_ht_avt_remise = ?, total_ht = ?, validation_lieu = ?, valide = ?, modified = ?, fct_payee = ?, fct_envoyee = ?
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
          fct_payee,
          fct_envoyee,
          id
        ],
        (err) => {
          if (err) return res.status(500).json({ error: "Erreur base de données" });

          // NB : l'envoi vers Axonaut n'est plus automatique ici.
          // Le trésorier décide explicitement quand pousser la facture
          // (bouton dédié « Envoyer vers Axonaut » + confirmation côté client,
          // route POST /api/axonaut/sync/bc1/:id). Cela évite qu'une facture
          // Axonaut soit créée à la validation puis désynchronisée si le BC1
          // est modifié ensuite (Axonaut ne met pas à jour une facture existante).

          if (pack1Changed) {
            db.query(
              `UPDATE entreprises SET place_plan = NULL, modified = ? WHERE id = ?`,
              [modified, entrepriseId],
              (err) => {
                if (err) return res.status(500).json({ error: "Erreur lors de la mise à jour de place_plan" });
                res.json({ message: "Commande mise à jour et place_plan réinitialisé" });
              }
            );
          } else {
            res.json({ message: "Commande mise à jour" });
          }
        }
      );
    }
  );
};

exports.setFactureEnvoyee = (req, res) => {
  const id = req.params.id;
  db.query(
    `UPDATE commande1s SET fct_envoyee = 1 WHERE id = ?`,
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
    `UPDATE commande1s SET fct_payee = 1 WHERE id = ?`,
    [id],
    (err) => {
      if (err) return res.status(500).json({ error: "Erreur base de données" });
      res.json({ message: "Facture marquée comme payée" });

      // Propagate paid status to Axonaut (fire-and-forget)
      db.query(
        'SELECT axonaut_invoice_id FROM commande1s WHERE id = ?',
        [id],
        (err, rows) => {
          if (!err && rows[0]?.axonaut_invoice_id) {
            markInvoicePaid(rows[0].axonaut_invoice_id).catch(e =>
              console.error(`[Axonaut] markInvoicePaid BC1 #${id}:`, e.message)
            );
          }
        }
      );
    }
  );
};

exports.deleteCommande1 = (req, res) => {
  const id = req.params.id;

  // Get the Axonaut invoice ID before deleting
  db.query("SELECT axonaut_invoice_id FROM commande1s WHERE id = ?", [id], (err, rows) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });

    const axonautInvoiceId = rows[0]?.axonaut_invoice_id;

    db.query("DELETE FROM commande1s WHERE id = ?", [id], (err) => {
      if (err) return res.status(500).json({ error: "Erreur base de données" });
      res.json({ message: "Commande supprimée" });

      // Delete from Axonaut (fire-and-forget)
      if (axonautInvoiceId) {
        deleteAxonautInvoice(axonautInvoiceId).catch(e =>
          console.error(`[Axonaut] deleteInvoice BC1 #${id}:`, e.message)
        );
      }
    });
  });
};

exports.getAllCommande1s = (req, res) => {
  db.query("SELECT * FROM commande1s", (err, results) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });
    // On ne renvoie pas la signature (dataURL volumineux) dans la liste : elle est
    // chargée à la demande via getCommande1ById lors de la (re)génération du PDF.
    for (const row of results) delete row.signature;
    res.json(results);
  });
};
