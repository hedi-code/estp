// axonaut/axonautService.js
// Orchestrates all sync operations between the ESTP app and Axonaut.
// Uses mysql2 promise API (db.promise()) – no changes required to db.js.

const db = require('../config/db');
const { client: axonaut } = require('./axonautClient');
const { toAxonautCompany }  = require('./mappers/companyMapper');
const { toAxonautInvoice1 } = require('./mappers/invoice1Mapper');
const { toAxonautInvoice2 } = require('./mappers/invoice2Mapper');

// ─── HELPERS ────────────────────────────────────────────────────────────────

const q = (sql, params) => db.promise().query(sql, params);

// ─── COMPANY SYNC ────────────────────────────────────────────────────────────

/**
 * Sync one entreprise to Axonaut.
 * Creates a new company if axonaut_company_id is NULL, updates otherwise.
 * Returns the Axonaut company id (string).
 */
async function syncEntreprise(entrepriseId) {
  const [[entreprise]] = await q(
    `SELECT e.*, s.nom AS secteur_nom
     FROM entreprises e
     LEFT JOIN secteurs s ON s.id = e.secteur_id
     WHERE e.id = ?`,
    [entrepriseId]
  );
  if (!entreprise) throw new Error(`Entreprise ${entrepriseId} introuvable`);

  const payload = toAxonautCompany(entreprise, entreprise.secteur_nom);

  if (entreprise.axonaut_company_id) {
    await axonaut.patch(`/companies/${entreprise.axonaut_company_id}`, payload);
    return entreprise.axonaut_company_id;
  }

  const created = await axonaut.post('/companies', payload);
  await q(
    'UPDATE entreprises SET axonaut_company_id = ? WHERE id = ?',
    [String(created.id), entrepriseId]
  );
  return String(created.id);
}

// ─── BC1 SYNC ────────────────────────────────────────────────────────────────

/**
 * Sync a BC1 (commande1) to Axonaut as an invoice.
 * Resolves the surface from pack1s_surface by subtracting option totals from
 * total_ht_avt_remise (price before discount) so we can match the pack price.
 * Returns the Axonaut invoice id (string).
 */
async function syncBC1(commande1Id) {
  // 1. Load commande + pack + entreprise
  const [[commande]] = await q(
    `SELECT c.*, p.titre AS pack_titre,
            e.axonaut_company_id, e.id AS entreprise_id
     FROM commande1s c
     JOIN entreprises e ON e.id = c.entreprise_id
     LEFT JOIN pack1s p ON p.id = c.pack1_id
     WHERE c.id = ?`,
    [commande1Id]
  );
  if (!commande) throw new Error(`Commande1 ${commande1Id} introuvable`);

  // 2. Ensure the company exists in Axonaut
  const axonautCompanyId = commande.axonaut_company_id
    || await syncEntreprise(commande.entreprise_id);

  // 3. Load options for this order
  const [optRows] = await q(
    `SELECT o.name, o.prix_ht, o.axonaut_product_id, co.qty
     FROM commande1_options co
     JOIN option1s o ON o.id = co.option1_id
     WHERE co.commande1_id = ?`,
    [commande1Id]
  );

  // 4. Derive pack price by subtracting option totals from total_ht_avt_remise
  const optionsTotal = optRows.reduce((sum, r) => sum + parseFloat(r.prix_ht) * r.qty, 0);
  const packPriceGuess = parseFloat(commande.total_ht_avt_remise || 0) - optionsTotal;

  // 5. Try to match the surface row from pack1s_surface
  let surface = null;
  if (commande.pack1_id && packPriceGuess > 0) {
    const [surfaceRows] = await q(
      `SELECT surface, prix, axonaut_product_id FROM pack1s_surface
       WHERE id_pack1 = ? AND ABS(prix - ?) < 0.01
       LIMIT 1`,
      [commande.pack1_id, packPriceGuess]
    );
    surface = surfaceRows[0] || null;
  }

  // 6. Build payload and create/update invoice in Axonaut
  const bc1Data = {
    commande,
    pack: { titre: commande.pack_titre || null },
    surface,
    options: optRows.map(r => ({
      name: r.name,
      prix_ht: r.prix_ht,
      qty: r.qty,
      axonaut_product_id: r.axonaut_product_id,
    })),
  };

  const payload = toAxonautInvoice1(bc1Data, axonautCompanyId);
  const oldInvoiceId = commande.axonaut_invoice_id;

  // Nothing to invoice yet — skip the API call (and clean up any stale invoice)
  if (payload.products.length === 0) {
    if (oldInvoiceId) {
      try { await axonaut.delete(`/invoices/${oldInvoiceId}`); }
      catch (e) { console.error(`[Axonaut] delete stale invoice ${oldInvoiceId}: ${e.message}`); }
      await q('UPDATE commande1s SET axonaut_invoice_id = NULL WHERE id = ?', [commande1Id]);
    }
    return null;
  }

  // Resync: create the new invoice, point the DB at it, then best-effort delete the old one
  const created = await axonaut.post('/invoices', payload);
  await q(
    'UPDATE commande1s SET axonaut_invoice_id = ? WHERE id = ?',
    [String(created.id), commande1Id]
  );
  if (oldInvoiceId) {
    try { await axonaut.delete(`/invoices/${oldInvoiceId}`); }
    catch (e) { console.error(`[Axonaut] delete old invoice ${oldInvoiceId}: ${e.message}`); }
  }
  return String(created.id);
}

// ─── BC2 SYNC ────────────────────────────────────────────────────────────────

/**
 * Sync a BC2 (commande2) to Axonaut as an invoice.
 * Returns the Axonaut invoice id (string).
 */
async function syncBC2(commande2Id) {
  // 1. Load commande + pack + entreprise
  const [[commande]] = await q(
    `SELECT c.*,
            p.nom AS pack_nom, p.coloris AS pack_coloris, p.prix_ht AS pack_prix_ht,
            p.axonaut_product_id AS pack_axonaut_product_id,
            e.axonaut_company_id, e.id AS entreprise_id
     FROM commande2s c
     JOIN entreprises e ON e.id = c.entreprise_id
     LEFT JOIN pack2s p ON p.id = c.pack2_id
     WHERE c.id = ?`,
    [commande2Id]
  );
  if (!commande) throw new Error(`Commande2 ${commande2Id} introuvable`);

  // 2. Ensure the company exists in Axonaut
  const axonautCompanyId = commande.axonaut_company_id
    || await syncEntreprise(commande.entreprise_id);

  // 3. Load options for this order
  const [optRows] = await q(
    `SELECT o.nom, o.prix_ht, o.taux_tva, o.axonaut_product_id,
            co.qty, co.color, co.reduction
     FROM commande2_options co
     JOIN option2s o ON o.id = co.option2_id
     WHERE co.commande2_id = ?`,
    [commande2Id]
  );

  // 4. Build payload and create/update invoice in Axonaut
  const bc2Data = {
    commande,
    pack: {
      nom:      commande.pack_nom      || null,
      coloris:  commande.pack_coloris  || null,
      prix_ht:  commande.pack_prix_ht  || 0,
      axonaut_product_id: commande.pack_axonaut_product_id || null,
    },
    options: optRows.map(r => ({
      nom:       r.nom,
      prix_ht:   r.prix_ht,
      taux_tva:  r.taux_tva,
      qty:       r.qty,
      color:     r.color,
      reduction: r.reduction,
      axonaut_product_id: r.axonaut_product_id,
    })),
  };

  const payload = toAxonautInvoice2(bc2Data, axonautCompanyId);
  const oldInvoiceId = commande.axonaut_invoice_id;

  // Nothing to invoice yet — skip the API call (and clean up any stale invoice)
  if (payload.products.length === 0) {
    if (oldInvoiceId) {
      try { await axonaut.delete(`/invoices/${oldInvoiceId}`); }
      catch (e) { console.error(`[Axonaut] delete stale invoice ${oldInvoiceId}: ${e.message}`); }
      await q('UPDATE commande2s SET axonaut_invoice_id = NULL WHERE id = ?', [commande2Id]);
    }
    return null;
  }

  // Resync: create the new invoice, point the DB at it, then best-effort delete the old one
  const created = await axonaut.post('/invoices', payload);
  await q(
    'UPDATE commande2s SET axonaut_invoice_id = ? WHERE id = ?',
    [String(created.id), commande2Id]
  );
  if (oldInvoiceId) {
    try { await axonaut.delete(`/invoices/${oldInvoiceId}`); }
    catch (e) { console.error(`[Axonaut] delete old invoice ${oldInvoiceId}: ${e.message}`); }
  }
  return String(created.id);
}

// ─── CATALOG SYNC (individual items) ─────────────────────────────────────────

const DEFAULT_TVA = 20;

async function syncPack1Surface(surfaceId) {
  const [[row]] = await q(
    `SELECT s.id, s.surface, s.prix, s.axonaut_product_id,
            p.titre AS pack_titre
     FROM pack1s_surface s
     JOIN pack1s p ON p.id = s.id_pack1
     WHERE s.id = ?`,
    [surfaceId]
  );
  if (!row) throw new Error(`pack1s_surface ${surfaceId} introuvable`);

  const payload = {
    name: `${row.pack_titre} – ${row.surface} m²`,
    product_code: `PACK1-SURF-${row.id}`,
    price: parseFloat(row.prix),
    tax_rate: DEFAULT_TVA,
  };

  if (row.axonaut_product_id) {
    await axonaut.patch(`/products/${row.axonaut_product_id}`, payload);
    return row.axonaut_product_id;
  }
  const created = await axonaut.post('/products', payload);
  await q('UPDATE pack1s_surface SET axonaut_product_id = ? WHERE id = ?', [String(created.id), surfaceId]);
  return String(created.id);
}

async function syncOption1(option1Id) {
  const [[row]] = await q('SELECT * FROM option1s WHERE id = ?', [option1Id]);
  if (!row) throw new Error(`option1 ${option1Id} introuvable`);

  const payload = {
    name: row.name,
    product_code: `OPT1-${row.id}`,
    price: parseFloat(row.prix_ht),
    tax_rate: DEFAULT_TVA,
    ...(row.description ? { description: row.description } : {}),
  };

  if (row.axonaut_product_id) {
    await axonaut.patch(`/products/${row.axonaut_product_id}`, payload);
    return row.axonaut_product_id;
  }
  const created = await axonaut.post('/products', payload);
  await q('UPDATE option1s SET axonaut_product_id = ? WHERE id = ?', [String(created.id), option1Id]);
  return String(created.id);
}

async function syncPack2(pack2Id) {
  const [[row]] = await q('SELECT * FROM pack2s WHERE id = ?', [pack2Id]);
  if (!row) throw new Error(`pack2 ${pack2Id} introuvable`);

  const name = row.coloris ? `${row.nom} – ${row.coloris}` : row.nom;
  const payload = {
    name,
    product_code: `PACK2-${row.id}`,
    price: parseFloat(row.prix_ht),
    tax_rate: DEFAULT_TVA,
  };

  if (row.axonaut_product_id) {
    await axonaut.patch(`/products/${row.axonaut_product_id}`, payload);
    return row.axonaut_product_id;
  }
  const created = await axonaut.post('/products', payload);
  await q('UPDATE pack2s SET axonaut_product_id = ? WHERE id = ?', [String(created.id), pack2Id]);
  return String(created.id);
}

async function syncOption2(option2Id) {
  const [[row]] = await q('SELECT * FROM option2s WHERE id = ?', [option2Id]);
  if (!row) throw new Error(`option2 ${option2Id} introuvable`);

  const name = row.coloris ? `${row.nom} – ${row.coloris}` : row.nom;
  const tva  = parseFloat(row.taux_tva) || DEFAULT_TVA;
  const payload = {
    name,
    product_code: `OPT2-${row.id}`,
    price: parseFloat(row.prix_ht),
    tax_rate: tva,
    ...(row.description ? { description: row.description } : {}),
  };

  if (row.axonaut_product_id) {
    await axonaut.patch(`/products/${row.axonaut_product_id}`, payload);
    return row.axonaut_product_id;
  }
  const created = await axonaut.post('/products', payload);
  await q('UPDATE option2s SET axonaut_product_id = ? WHERE id = ?', [String(created.id), option2Id]);
  return String(created.id);
}

// ─── DELETE HELPERS ──────────────────────────────────────────────────────────

async function deleteAxonautProduct(axonautProductId) {
  if (!axonautProductId) return;
  await axonaut.delete(`/products/${axonautProductId}`);
}

async function deleteAxonautCompany(axonautCompanyId) {
  if (!axonautCompanyId) return;
  await axonaut.delete(`/companies/${axonautCompanyId}`);
}

async function deleteAxonautInvoice(axonautInvoiceId) {
  if (!axonautInvoiceId) return;
  await axonaut.delete(`/invoices/${axonautInvoiceId}`);
}

// ─── MARK PAID ───────────────────────────────────────────────────────────────

/**
 * Mark an Axonaut invoice as paid.
 */
async function markInvoicePaid(axonautInvoiceId) {
  await axonaut.patch(`/invoices/${axonautInvoiceId}`, { status: 'paid' });
}

// ─── BATCH SYNC ──────────────────────────────────────────────────────────────

/**
 * Sync all validated commandes that have no Axonaut invoice yet.
 * Returns a summary { bc1: [], bc2: [], errors: [] }.
 */
async function syncAllPending() {
  const [bc1Rows] = await q(
    'SELECT id FROM commande1s WHERE valide = 1 AND axonaut_invoice_id IS NULL'
  );
  const [bc2Rows] = await q(
    'SELECT id FROM commande2s WHERE valide = 1 AND axonaut_invoice_id IS NULL'
  );

  const summary = { bc1: [], bc2: [], errors: [] };

  for (const { id } of bc1Rows) {
    try {
      summary.bc1.push({ id, axonautId: await syncBC1(id) });
    } catch (e) {
      summary.errors.push({ type: 'BC1', id, error: e.message });
    }
  }

  for (const { id } of bc2Rows) {
    try {
      summary.bc2.push({ id, axonautId: await syncBC2(id) });
    } catch (e) {
      summary.errors.push({ type: 'BC2', id, error: e.message });
    }
  }

  return summary;
}

module.exports = {
  syncEntreprise, syncBC1, syncBC2, markInvoicePaid, syncAllPending,
  syncPack1Surface, syncOption1, syncPack2, syncOption2,
  deleteAxonautProduct, deleteAxonautCompany, deleteAxonautInvoice,
};
