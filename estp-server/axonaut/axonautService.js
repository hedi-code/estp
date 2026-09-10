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

/**
 * Look up an existing Axonaut product by its product_code.
 * Axonaut's product_code filter is a substring match, so we re-check for
 * an exact match in the results.
 * Returns the Axonaut product id (string) or null if not found.
 */
async function findAxonautProductIdByCode(productCode) {
  try {
    const res = await axonaut.get(`/products?product_code=${encodeURIComponent(productCode)}`);
    if (!Array.isArray(res) || res.length === 0) return null;
    const exact = res.find(p => p.product_code === productCode);
    return exact ? String(exact.id) : null;
  } catch (e) {
    console.error(`[Axonaut] product lookup failed for ${productCode}: ${e.message}`);
    return null;
  }
}

/**
 * Ensure a catalog row has its axonaut_product_id populated.
 * If the row's id is null, try to find a matching Axonaut product by product_code
 * (so we link to an existing product instead of creating a duplicate). Persists the
 * id in the given table when found.
 * Returns the resolved id (string) or null.
 */
async function ensureProductIdByCode(table, rowId, currentAxonautId, productCode) {
  if (currentAxonautId) return String(currentAxonautId);
  const found = await findAxonautProductIdByCode(productCode);
  if (found) {
    await q(`UPDATE ${table} SET axonaut_product_id = ? WHERE id = ?`, [found, rowId]);
  }
  return found;
}

/**
 * Crée une facture Axonaut. Si Axonaut renvoie 404 (une ressource référencée
 * n'existe plus — ex. un produit supprimé), on retente une fois sans les ids de
 * produits, en laissant Axonaut recréer les lignes à partir du nom/prix. Évite
 * l'erreur "404 Resource not found" quand un objet a été supprimé côté Axonaut.
 */
async function createAxonautInvoice(payload) {
  try {
    return await axonaut.post('/invoices', payload);
  } catch (e) {
    if (e && e.status === 404) {
      console.warn('[Axonaut] 404 sur /invoices → nouvelle tentative sans les ids de produits');
      const stripped = {
        ...payload,
        products: (payload.products || []).map(({ id, ...rest }) => rest),
      };
      return await axonaut.post('/invoices', stripped);
    }
    throw e;
  }
}

// ─── COMPANY SYNC ────────────────────────────────────────────────────────────

const normSiren = (v) => String(v || '').replace(/\D/g, '');
const normName  = (v) => String(v || '').trim().toLowerCase();

/**
 * Look for an EXISTING Axonaut company that matches this entreprise, to avoid
 * creating duplicates when axonaut_company_id was never persisted (fire-and-forget
 * failures, legacy data from the previous developer, etc.).
 * Match priority: SIREN (registration_number) first, then exact company name.
 * Returns the Axonaut company id (string) or null.
 */
async function findExistingAxonautCompanyId(entreprise) {
  const siren = normSiren(entreprise.siren);
  const name  = normName(entreprise.nom);

  // 1. Match by SIREN — the most reliable key.
  if (siren) {
    try {
      const res = await axonaut.get(`/companies?search=${encodeURIComponent(siren)}`);
      const hit = Array.isArray(res)
        ? res.find(c => c.is_disabled !== true && normSiren(c.registration_number) === siren)
        : null;
      if (hit) return String(hit.id);
    } catch (e) {
      console.error(`[Axonaut] company lookup by SIREN failed (${siren}): ${e.message}`);
    }
  }

  // 2. Fallback: exact (case-insensitive) name match.
  if (name) {
    try {
      const res = await axonaut.get(`/companies?search=${encodeURIComponent(entreprise.nom)}`);
      const hit = Array.isArray(res)
        ? res.find(c => c.is_disabled !== true && normName(c.name) === name)
        : null;
      if (hit) return String(hit.id);
    } catch (e) {
      console.error(`[Axonaut] company lookup by name failed (${entreprise.nom}): ${e.message}`);
    }
  }

  return null;
}

/**
 * Récupère une société Axonaut par id. Renvoie l'objet société, ou null si elle
 * n'existe plus (404). Sert à détecter les clients supprimés ET désactivés
 * (is_disabled) : Axonaut refuse de facturer un client désactivé et répond alors
 * "404 Resource not found" au POST /invoices.
 */
async function getAxonautCompany(companyId) {
  try {
    return await axonaut.get(`/companies/${companyId}`);
  } catch (e) {
    if (e && e.status === 404) return null;
    throw e;
  }
}

/**
 * Charge le contact principal (interlocuteur) d'une entreprise.
 * Renvoie la ligne `contacts` ou null.
 */
async function loadContactPrincipal(entreprise) {
  if (!entreprise.contact_principal_id) return null;
  const [[c]] = await q(
    `SELECT nom, prenom, email, telephone1, fonction, genre
     FROM contacts WHERE id = ?`,
    [entreprise.contact_principal_id]
  );
  return c || null;
}

/**
 * Ajoute l'interlocuteur (contact principal) comme "employé" du client Axonaut,
 * pour que son nom soit stocké côté Axonaut. Dé-doublonnage par email sur la liste
 * `employees` de la société (GET société), fiable contrairement à /employees?email=.
 * Best-effort : ne doit jamais faire échouer la synchro société / la facture.
 */
async function ensureAxonautEmployee(companyId, entreprise, company = null) {
  try {
    const contact = await loadContactPrincipal(entreprise);
    const email = String(contact?.email || '').trim();
    if (!email) return; // l'email est obligatoire côté Axonaut

    // Dé-doublonnage FIABLE : la fiche société renvoie sa liste `employees`.
    // (L'endpoint /employees?email= répond 404 sur ce compte et créait un doublon
    // à chaque envoi.) On relit la société au besoin.
    const comp = company || (await getAxonautCompany(companyId));
    const emps = comp && Array.isArray(comp.employees) ? comp.employees : [];
    const already = emps.some(
      (e) => String(e.email || '').trim().toLowerCase() === email.toLowerCase()
    );
    if (already) return;

    await axonaut.post('/employees', {
      company_id: Number(companyId),
      email,
      firstname: contact.prenom || '',
      lastname: contact.nom || '',
      ...(contact.fonction ? { job: contact.fonction } : {}),
    });
  } catch (e) {
    console.error(`[Axonaut] ensureAxonautEmployee (entreprise ${entreprise.id}): ${e.message}`);
  }
}

/**
 * Sync one entreprise to Axonaut et renvoie l'id d'un client ACTIF, prêt à être
 * facturé (string).
 *
 * Le stored axonaut_company_id n'est réutilisé QUE s'il pointe vers un client
 * réellement exploitable : ni supprimé (GET 404), ni désactivé (is_disabled).
 * En effet, quand on "supprime" un client qui a des factures, Axonaut ne le
 * supprime pas mais le DÉSACTIVE ; le PATCH continue de répondre 200 mais le
 * POST /invoices répond "404 Resource not found". On détecte donc ce cas via un
 * GET et, si le client est inutilisable, on l'oublie pour repartir en
 * find-or-create (la recherche Axonaut excluant déjà les désactivés, on
 * retombe soit sur un client actif existant, soit sur un client neuf).
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
  let companyId = null;

  // 1. Id déjà connu → on ne le garde que s'il pointe vers un client ACTIF.
  if (entreprise.axonaut_company_id) {
    const existing = await getAxonautCompany(entreprise.axonaut_company_id);
    if (existing && existing.is_disabled !== true) {
      companyId = String(entreprise.axonaut_company_id);
    } else {
      console.warn(
        `[Axonaut] société ${entreprise.axonaut_company_id} inutilisable ` +
          `(${existing ? 'désactivée' : 'supprimée'}) → on repart sur un client actif`
      );
      await q('UPDATE entreprises SET axonaut_company_id = NULL WHERE id = ?', [entrepriseId]);
      entreprise.axonaut_company_id = null;
    }
  }

  // 2. Sinon : réutiliser un client actif existant (anti-doublon), sinon le créer.
  if (!companyId) {
    const existingId = await findExistingAxonautCompanyId(entreprise);
    if (existingId) {
      companyId = existingId;
    } else {
      const created = await axonaut.post('/companies', payload);
      companyId = String(created.id);
    }
    await q('UPDATE entreprises SET axonaut_company_id = ? WHERE id = ?', [companyId, entrepriseId]);
  }

  // 3. Mettre la fiche à jour puis garantir l'interlocuteur.
  //    ensureAxonautEmployee relit la société (GET) pour dé-doublonner sur la liste
  //    `employees` — la réponse du PATCH ne la contient pas toujours.
  await axonaut.patch(`/companies/${companyId}`, payload);
  await ensureAxonautEmployee(companyId, entreprise);
  return companyId;
}

// ─── BC1 SYNC ────────────────────────────────────────────────────────────────

/**
 * Sync a BC1 (commande1) to Axonaut as an invoice.
 * Resolves the surface from pack1s_surface by subtracting option totals from
 * total_ht_avt_remise (price before discount) so we can match the pack price.
 * Returns the Axonaut invoice id (string).
 */
async function syncBC1(commande1Id, { force = false } = {}) {
  // 1. Load commande + surface + pack + entreprise.
  // NOTE: commande1s.pack1_id references pack1s_surface.id (not pack1s.id).
  // We join pack1s through the surface row to recover the pack title.
  const [[commande]] = await q(
    `SELECT c.*,
            ps.surface             AS pack_surface,
            ps.prix                AS pack_surface_prix,
            ps.axonaut_product_id  AS pack_surface_axonaut_id,
            p.titre                AS pack_titre,
            e.axonaut_company_id, e.id AS entreprise_id
     FROM commande1s c
     JOIN entreprises e ON e.id = c.entreprise_id
     LEFT JOIN pack1s_surface ps ON ps.id = c.pack1_id
     LEFT JOIN pack1s p ON p.id = ps.id_pack1
     WHERE c.id = ?`,
    [commande1Id]
  );
  if (!commande) throw new Error(`Commande1 ${commande1Id} introuvable`);

  // Wait until the commande is validated before syncing — Axonaut invoices are
  // immutable, so we only push once the user has marked the commande "done".
  if (!commande.valide) {
    return commande.axonaut_invoice_id || null;
  }

  // 2. Ensure the company exists in Axonaut.
  // On résout TOUJOURS via syncEntreprise : ça met la fiche à jour et, surtout,
  // ça détecte/répare une société supprimée côté Axonaut (sinon on enverrait la
  // facture vers un client mort → "404 Resource not found").
  const axonautCompanyId = await syncEntreprise(commande.entreprise_id);

  // 3. Load options for this order
  const [optRows] = await q(
    `SELECT o.id AS option1_id, o.name, o.prix_ht, o.axonaut_product_id, co.qty
     FROM commande1_options co
     JOIN option1s o ON o.id = co.option1_id
     WHERE co.commande1_id = ?`,
    [commande1Id]
  );

  // 3b. Backfill missing axonaut_product_ids from Axonaut by product_code, so the
  // invoice links to existing products instead of letting Axonaut create duplicates.
  if (commande.pack1_id) {
    commande.pack_surface_axonaut_id = await ensureProductIdByCode(
      'pack1s_surface',
      commande.pack1_id,
      commande.pack_surface_axonaut_id,
      `PACK1-SURF-${commande.pack1_id}`
    );
  }
  for (const opt of optRows) {
    opt.axonaut_product_id = await ensureProductIdByCode(
      'option1s',
      opt.option1_id,
      opt.axonaut_product_id,
      `OPT1-${opt.option1_id}`
    );
  }

  // 4. Build payload and create/update invoice in Axonaut
  const surface = (commande.pack1_id && commande.pack_surface != null)
    ? {
        surface: commande.pack_surface,
        prix: commande.pack_surface_prix,
        axonaut_product_id: commande.pack_surface_axonaut_id,
      }
    : null;

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

  // Axonaut invoices are immutable (API supports only GET/POST) — skip if already synced,
  // SAUF en mode force : on crée alors une NOUVELLE facture et on écrase l'id stocké
  // (l'ancienne facture Axonaut n'est pas touchée, elle est gérée manuellement côté Axonaut).
  if (commande.axonaut_invoice_id && !force) {
    return commande.axonaut_invoice_id;
  }

  // Date d'émission = maintenant (moment de l'envoi / du clic).
  const payload = toAxonautInvoice1(bc1Data, axonautCompanyId, new Date());

  // Nothing to invoice yet — don't create an empty invoice that would then be locked
  if (payload.products.length === 0) {
    return null;
  }

  const created = await createAxonautInvoice(payload);
  await q(
    'UPDATE commande1s SET axonaut_invoice_id = ? WHERE id = ?',
    [String(created.id), commande1Id]
  );
  return String(created.id);
}

// ─── BC2 SYNC ────────────────────────────────────────────────────────────────

/**
 * Sync a BC2 (commande2) to Axonaut as an invoice.
 * Returns the Axonaut invoice id (string).
 */
async function syncBC2(commande2Id, { force = false } = {}) {
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

  // Wait until the commande is validated before syncing — Axonaut invoices are
  // immutable, so we only push once the user has marked the commande "done".
  if (!commande.valide) {
    return commande.axonaut_invoice_id || null;
  }

  // 2. Ensure the company exists in Axonaut.
  // On résout TOUJOURS via syncEntreprise : ça met la fiche à jour et, surtout,
  // ça détecte/répare une société supprimée côté Axonaut (sinon on enverrait la
  // facture vers un client mort → "404 Resource not found").
  const axonautCompanyId = await syncEntreprise(commande.entreprise_id);

  // 3. Load options for this order
  const [optRows] = await q(
    `SELECT o.id AS option2_id, o.nom, o.prix_ht, o.taux_tva, o.axonaut_product_id,
            co.qty, co.color, co.reduction
     FROM commande2_options co
     JOIN option2s o ON o.id = co.option2_id
     WHERE co.commande2_id = ?`,
    [commande2Id]
  );

  // 3b. Backfill missing axonaut_product_ids by product_code so we link to existing
  // Axonaut products instead of letting Axonaut create duplicates.
  if (commande.pack2_id) {
    commande.pack_axonaut_product_id = await ensureProductIdByCode(
      'pack2s',
      commande.pack2_id,
      commande.pack_axonaut_product_id,
      `PACK2-${commande.pack2_id}`
    );
  }
  for (const opt of optRows) {
    opt.axonaut_product_id = await ensureProductIdByCode(
      'option2s',
      opt.option2_id,
      opt.axonaut_product_id,
      `OPT2-${opt.option2_id}`
    );
  }

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

  // Axonaut invoices are immutable (API supports only GET/POST) — skip if already synced,
  // SAUF en mode force : on crée alors une NOUVELLE facture et on écrase l'id stocké
  // (l'ancienne facture Axonaut n'est pas touchée, elle est gérée manuellement côté Axonaut).
  if (commande.axonaut_invoice_id && !force) {
    return commande.axonaut_invoice_id;
  }

  // Date d'émission = maintenant (moment de l'envoi / du clic).
  const payload = toAxonautInvoice2(bc2Data, axonautCompanyId, new Date());

  // Nothing to invoice yet — don't create an empty invoice that would then be locked
  if (payload.products.length === 0) {
    return null;
  }

  const created = await createAxonautInvoice(payload);
  await q(
    'UPDATE commande2s SET axonaut_invoice_id = ? WHERE id = ?',
    [String(created.id), commande2Id]
  );
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
