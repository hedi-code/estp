// utils/forumConfig.js
// Charge les paramètres "édition" depuis la table `config` (clé/valeur) avec valeurs de repli
// = les valeurs historiques en dur. Permet de rendre les emails dynamiques sans régression :
// si une clé est absente, on retombe sur l'ancienne valeur.

const db = require('../config/db');

function loadForumConfig() {
  return new Promise((resolve) => {
    db.query('SELECT config_name, config_value FROM config', (err, rows) => {
      const m = {};
      if (!err && Array.isArray(rows)) {
        rows.forEach((r) => {
          m[r.config_name] = r.config_value;
        });
      }
      const get = (k, fb) => (m[k] !== undefined && m[k] !== null && m[k] !== '' ? m[k] : fb);
      resolve({
        edition: get('edition_number', '47'),
        editionLabel: `${get('edition_number', '47')}ème édition`,
        eventDate: get('event_date', '24 novembre 2026'),
        bookDeadline: get('book_deadline', '7 octobre 2026'),
        bc2OpenDate: get('bc2_open_date', '30 septembre 2026'),
        bc2ExposantsDeadline: get('bc2_exposants_deadline', '19 novembre 2026'),
        bc1SoldeDate: get('bc1_solde_date', '10 novembre 2026'),
        invoicePrefix: get('invoice_prefix', 'festp'),
        invoiceYear: get('invoice_year', '2026'),
      });
    });
  });
}

module.exports = { loadForumConfig };
