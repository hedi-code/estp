// controllers/dashboardController.js

const db = require("../config/db");

exports.getCommercialDashboardStats = (req, res) => {
  const commercialId = req.params.commercialId;

  // Get comprehensive BC1 and BC2 statistics for this commercial
  const queries = {
    paidBC1: `
      SELECT COUNT(*) as count, COALESCE(SUM(total_ht), 0) as total
      FROM commande1s c1
      JOIN entreprises e ON c1.entreprise_id = e.id
      WHERE e.commercial_id = ? AND c1.fct_payee = 1
    `,
    unpaidBC1: `
      SELECT COUNT(*) as count, COALESCE(SUM(total_ht), 0) as total
      FROM commande1s c1
      JOIN entreprises e ON c1.entreprise_id = e.id
      WHERE e.commercial_id = ? AND c1.fct_payee = 0
    `,
    paidBC2: `
      SELECT COUNT(*) as count, COALESCE(SUM(total_ht), 0) as total
      FROM commande2s c2
      JOIN entreprises e ON c2.entreprise_id = e.id
      WHERE e.commercial_id = ? AND c2.fct_payee = 1
    `,
    unpaidBC2: `
      SELECT COUNT(*) as count, COALESCE(SUM(total_ht), 0) as total
      FROM commande2s c2
      JOIN entreprises e ON c2.entreprise_id = e.id
      WHERE e.commercial_id = ? AND c2.fct_payee = 0
    `,
    totalBC1: `
      SELECT COUNT(*) as count, COALESCE(SUM(total_ht), 0) as total
      FROM commande1s c1
      JOIN entreprises e ON c1.entreprise_id = e.id
      WHERE e.commercial_id = ?
    `,
    totalBC2: `
      SELECT COUNT(*) as count, COALESCE(SUM(total_ht), 0) as total
      FROM commande2s c2
      JOIN entreprises e ON c2.entreprise_id = e.id
      WHERE e.commercial_id = ?
    `
  };

  // Execute all queries
  Promise.all([
    new Promise((resolve, reject) => {
      db.query(queries.paidBC1, [commercialId], (err, result) => {
        if (err) reject(err);
        else resolve(result[0]);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(queries.unpaidBC1, [commercialId], (err, result) => {
        if (err) reject(err);
        else resolve(result[0]);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(queries.paidBC2, [commercialId], (err, result) => {
        if (err) reject(err);
        else resolve(result[0]);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(queries.unpaidBC2, [commercialId], (err, result) => {
        if (err) reject(err);
        else resolve(result[0]);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(queries.totalBC1, [commercialId], (err, result) => {
        if (err) reject(err);
        else resolve(result[0]);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(queries.totalBC2, [commercialId], (err, result) => {
        if (err) reject(err);
        else resolve(result[0]);
      });
    })
  ])
  .then(([paidBC1Data, unpaidBC1Data, paidBC2Data, unpaidBC2Data, totalBC1Data, totalBC2Data]) => {
    res.json({
      paidBC1Count: paidBC1Data.count || 0,
      unpaidBC1Count: unpaidBC1Data.count || 0,
      paidBC2Count: paidBC2Data.count || 0,
      unpaidBC2Count: unpaidBC2Data.count || 0,
      totalBC1Count: totalBC1Data.count || 0,
      totalBC2Count: totalBC2Data.count || 0,
      paidBC1Total: paidBC1Data.total || 0,
      unpaidBC1Total: unpaidBC1Data.total || 0,
      paidBC2Total: paidBC2Data.total || 0,
      unpaidBC2Total: unpaidBC2Data.total || 0,
      totalBC1Total: totalBC1Data.total || 0,
      totalBC2Total: totalBC2Data.total || 0,
      commercialBC1Total: totalBC1Data.total || 0,
      commercialBC2Total: totalBC2Data.total || 0
    });
  })
  .catch(err => {
    console.error('Error getting commercial dashboard stats:', err);
    res.status(500).json({ error: 'Erreur base de données' });
  });
};

exports.getTopOptions = (req, res) => {
  // Get all purchased options for BC1
  const topBC1Query = `
    SELECT
      o1.id as option_id,
      o1.name as option_name,
      o1.prix_ht,
      SUM(co1.qty) as total_quantity,
      COUNT(DISTINCT c1.entreprise_id) as entreprise_count
    FROM commande1_options co1
    JOIN option1s o1 ON co1.option1_id = o1.id
    JOIN commande1s c1 ON co1.commande1_id = c1.id
    GROUP BY o1.id, o1.name, o1.prix_ht
    ORDER BY total_quantity DESC
  `;

  // Get all purchased options for BC2
  const topBC2Query = `
    SELECT
      o2.id as option_id,
      o2.nom as option_name,
      o2.prix_ht,
      o2.category_id,
      SUM(co2.qty) as total_quantity,
      COUNT(DISTINCT c2.entreprise_id) as entreprise_count
    FROM commande2_options co2
    JOIN option2s o2 ON co2.option2_id = o2.id
    JOIN commande2s c2 ON co2.commande2_id = c2.id
    GROUP BY o2.id, o2.nom, o2.prix_ht, o2.category_id
    ORDER BY total_quantity DESC
  `;

  // Execute both queries
  Promise.all([
    new Promise((resolve, reject) => {
      db.query(topBC1Query, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(topBC2Query, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    })
  ])
  .then(([topBC1Options, topBC2Options]) => {
    res.json({
      topBC1Options: topBC1Options || [],
      topBC2Options: topBC2Options || []
    });
  })
  .catch(err => {
    console.error('Error getting top options:', err);
    res.status(500).json({ error: 'Erreur base de données' });
  });
};

exports.getEntreprisesByOption = (req, res) => {
  const { optionId } = req.params;
  const { bcType } = req.query;

  let query;

  if (bcType === 'BC1') {
    query = `
      SELECT
        e.nom as entreprise_nom,
        e.siren,
        co1.qty as quantite,
        c1.created as commande_date,
        c1.id as commande_id
      FROM commande1_options co1
      JOIN commande1s c1 ON co1.commande1_id = c1.id
      JOIN entreprises e ON c1.entreprise_id = e.id
      WHERE co1.option1_id = ?
      ORDER BY c1.created DESC
    `;
  } else if (bcType === 'BC2') {
    query = `
      SELECT
        e.nom as entreprise_nom,
        e.siren,
        co2.qty as quantite,
        c2.created as commande_date,
        c2.id as commande_id
      FROM commande2_options co2
      JOIN commande2s c2 ON co2.commande2_id = c2.id
      JOIN entreprises e ON c2.entreprise_id = e.id
      WHERE co2.option2_id = ?
      ORDER BY c2.created DESC
    `;
  } else {
    return res.status(400).json({ error: 'Type de BC invalide' });
  }

  db.query(query, [optionId], (err, results) => {
    if (err) {
      console.error('Error getting entreprises by option:', err);
      console.error('Query:', query);
      console.error('OptionId:', optionId);
      console.error('BcType:', bcType);
      return res.status(500).json({ error: 'Erreur base de données', details: err.message });
    }
    res.json(results);
  });
};

exports.getAllPaymentStats = (req, res) => {
  // Get comprehensive BC1 and BC2 payment statistics for all enterprises
  const queries = {
    paidBC1: `
      SELECT COUNT(*) as count, COALESCE(SUM(total_ht), 0) as total
      FROM commande1s
      WHERE fct_payee = 1
    `,
    unpaidBC1: `
      SELECT COUNT(*) as count, COALESCE(SUM(total_ht), 0) as total
      FROM commande1s
      WHERE fct_payee = 0
    `,
    paidBC2: `
      SELECT COUNT(*) as count, COALESCE(SUM(total_ht), 0) as total
      FROM commande2s
      WHERE fct_payee = 1
    `,
    unpaidBC2: `
      SELECT COUNT(*) as count, COALESCE(SUM(total_ht), 0) as total
      FROM commande2s
      WHERE fct_payee = 0
    `,
    totalBC1: `
      SELECT COUNT(*) as count, COALESCE(SUM(total_ht), 0) as total
      FROM commande1s
    `,
    totalBC2: `
      SELECT COUNT(*) as count, COALESCE(SUM(total_ht), 0) as total
      FROM commande2s
    `
  };

  // Execute all queries
  Promise.all([
    new Promise((resolve, reject) => {
      db.query(queries.paidBC1, (err, result) => {
        if (err) reject(err);
        else resolve(result[0]);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(queries.unpaidBC1, (err, result) => {
        if (err) reject(err);
        else resolve(result[0]);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(queries.paidBC2, (err, result) => {
        if (err) reject(err);
        else resolve(result[0]);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(queries.unpaidBC2, (err, result) => {
        if (err) reject(err);
        else resolve(result[0]);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(queries.totalBC1, (err, result) => {
        if (err) reject(err);
        else resolve(result[0]);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(queries.totalBC2, (err, result) => {
        if (err) reject(err);
        else resolve(result[0]);
      });
    })
  ])
  .then(([paidBC1Data, unpaidBC1Data, paidBC2Data, unpaidBC2Data, totalBC1Data, totalBC2Data]) => {
    res.json({
      paidBC1Count: paidBC1Data.count || 0,
      unpaidBC1Count: unpaidBC1Data.count || 0,
      paidBC2Count: paidBC2Data.count || 0,
      unpaidBC2Count: unpaidBC2Data.count || 0,
      totalBC1Count: totalBC1Data.count || 0,
      totalBC2Count: totalBC2Data.count || 0,
      paidBC1Total: paidBC1Data.total || 0,
      unpaidBC1Total: unpaidBC1Data.total || 0,
      paidBC2Total: paidBC2Data.total || 0,
      unpaidBC2Total: unpaidBC2Data.total || 0,
      totalBC1Total: totalBC1Data.total || 0,
      totalBC2Total: totalBC2Data.total || 0
    });
  })
  .catch(err => {
    console.error('Error getting all payment stats:', err);
    res.status(500).json({ error: 'Erreur base de données' });
  });
};