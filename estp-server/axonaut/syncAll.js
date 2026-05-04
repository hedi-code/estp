// axonaut/syncAll.js
// Full sync: catalog → companies → invoices (BC1 + BC2).
// Run order matters: products and companies must exist in Axonaut before
// invoices can reference them.
//
// Run with:  node axonaut/syncAll.js   (from estp-server/)
//
// Requires AXONAUT_API_KEY in environment (or .env at the project root).

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const db = require('../config/db');
const { client: axonaut } = require('./axonautClient');
const { syncEntreprise, syncBC1, syncBC2 } = require('./axonautService');

const DEFAULT_TVA = 20;
const DELAY_MS    = 1500;  // 1.5 s between requests
const MAX_RETRIES = 4;     // retry on 429 with exponential back-off

const q     = (sql, params) => db.promise().query(sql, params);
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ─── RATE-LIMIT HELPERS ──────────────────────────────────────────────────────

async function withRetry(fn) {
  let delay = 3000;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (err.status === 429 && attempt < MAX_RETRIES) {
        console.warn(`    [429] rate limited — waiting ${delay / 1000}s before retry ${attempt}/${MAX_RETRIES - 1}…`);
        await sleep(delay);
        delay *= 2;
      } else {
        throw err;
      }
    }
  }
}

async function upsertProduct(axonautProductId, payload) {
  if (axonautProductId) {
    await withRetry(() => axonaut.patch(`/products/${axonautProductId}`, payload));
    return String(axonautProductId);
  }
  const created = await withRetry(() => axonaut.post('/products', payload));
  return String(created.id);
}

// ─── 1. CATALOG ──────────────────────────────────────────────────────────────

async function syncPack1Surfaces() {
  const [rows] = await q(`
    SELECT s.id, s.surface, s.prix, s.axonaut_product_id,
           p.titre AS pack_titre
    FROM pack1s_surface s
    JOIN pack1s p ON p.id = s.id_pack1
    ORDER BY p.id, s.surface
  `);

  console.log(`\n── Pack1 surfaces: ${rows.length} rows`);
  const results = [];

  for (const row of rows) {
    const name = `Pack ${row.pack_titre} – ${row.surface} m²`;
    const payload = {
      name,
      product_code: `PACK1-SURF-${row.id}`,
      price: parseFloat(row.prix),
      tax_rate: DEFAULT_TVA,
    };
    try {
      const pid = await upsertProduct(row.axonaut_product_id, payload);
      if (!row.axonaut_product_id)
        await q('UPDATE pack1s_surface SET axonaut_product_id = ? WHERE id = ?', [pid, row.id]);
      console.log(`  [OK] ${name}  →  product #${pid}`);
      results.push({ id: row.id, name, axonautProductId: pid });
    } catch (err) {
      console.error(`  [ERR] ${name}: ${err.message}`);
      results.push({ id: row.id, name, error: err.message });
    }
    await sleep(DELAY_MS);
  }
  return results;
}

async function syncOption1s() {
  const [rows] = await q('SELECT * FROM option1s ORDER BY ordre ASC, id ASC');

  console.log(`\n── Option1s: ${rows.length} rows`);
  const results = [];

  for (const row of rows) {
    const payload = {
      name: row.name,
      product_code: `OPT1-${row.id}`,
      price: parseFloat(row.prix_ht),
      tax_rate: DEFAULT_TVA,
      ...(row.description ? { description: row.description } : {}),
    };
    try {
      const pid = await upsertProduct(row.axonaut_product_id, payload);
      if (!row.axonaut_product_id)
        await q('UPDATE option1s SET axonaut_product_id = ? WHERE id = ?', [pid, row.id]);
      console.log(`  [OK] ${row.name}  →  product #${pid}`);
      results.push({ id: row.id, name: row.name, axonautProductId: pid });
    } catch (err) {
      console.error(`  [ERR] ${row.name}: ${err.message}`);
      results.push({ id: row.id, name: row.name, error: err.message });
    }
    await sleep(DELAY_MS);
  }
  return results;
}

async function syncPack2s() {
  const [rows] = await q('SELECT * FROM pack2s ORDER BY nom ASC');

  console.log(`\n── Pack2s: ${rows.length} rows`);
  const results = [];

  for (const row of rows) {
    const name = row.coloris ? `${row.nom} – ${row.coloris}` : row.nom;
    const payload = {
      name,
      product_code: `PACK2-${row.id}`,
      price: parseFloat(row.prix_ht),
      tax_rate: DEFAULT_TVA,
    };
    try {
      const pid = await upsertProduct(row.axonaut_product_id, payload);
      if (!row.axonaut_product_id)
        await q('UPDATE pack2s SET axonaut_product_id = ? WHERE id = ?', [pid, row.id]);
      console.log(`  [OK] ${name}  →  product #${pid}`);
      results.push({ id: row.id, name, axonautProductId: pid });
    } catch (err) {
      console.error(`  [ERR] ${name}: ${err.message}`);
      results.push({ id: row.id, name, error: err.message });
    }
    await sleep(DELAY_MS);
  }
  return results;
}

async function syncOption2s() {
  const [rows] = await q(`
    SELECT o2.*, oc.name AS category_name
    FROM option2s o2
    LEFT JOIN option2_categories oc ON oc.id = o2.category_id
    ORDER BY o2.ordre ASC, o2.nom ASC
  `);

  console.log(`\n── Option2s: ${rows.length} rows`);
  const results = [];

  for (const row of rows) {
    const name = row.coloris ? `${row.nom} – ${row.coloris}` : row.nom;
    const tva  = parseFloat(row.taux_tva) || DEFAULT_TVA;
    const payload = {
      name,
      product_code: `OPT2-${row.id}`,
      price: parseFloat(row.prix_ht),
      tax_rate: tva,
      ...(row.description ? { description: row.description } : {}),
    };
    try {
      const pid = await upsertProduct(row.axonaut_product_id, payload);
      if (!row.axonaut_product_id)
        await q('UPDATE option2s SET axonaut_product_id = ? WHERE id = ?', [pid, row.id]);
      console.log(`  [OK] ${name}  →  product #${pid}`);
      results.push({ id: row.id, name, axonautProductId: pid });
    } catch (err) {
      console.error(`  [ERR] ${name}: ${err.message}`);
      results.push({ id: row.id, name, error: err.message });
    }
    await sleep(DELAY_MS);
  }
  return results;
}

async function runCatalogSync() {
  console.log('\n════════════════════════════════');
  console.log(' STEP 1 — Catalog');
  console.log('════════════════════════════════');

  const surf1 = await syncPack1Surfaces();
  const opt1  = await syncOption1s();
  const pack2 = await syncPack2s();
  const opt2  = await syncOption2s();

  console.log(`\n  Pack1 surfaces : ${surf1.length}  (${surf1.filter(r => !r.error).length} OK, ${surf1.filter(r => r.error).length} err)`);
  console.log(`  Option1s       : ${opt1.length}   (${opt1.filter(r => !r.error).length} OK, ${opt1.filter(r => r.error).length} err)`);
  console.log(`  Pack2s         : ${pack2.length}  (${pack2.filter(r => !r.error).length} OK, ${pack2.filter(r => r.error).length} err)`);
  console.log(`  Option2s       : ${opt2.length}   (${opt2.filter(r => !r.error).length} OK, ${opt2.filter(r => r.error).length} err)`);

  return [...surf1, ...opt1, ...pack2, ...opt2].filter(r => r.error);
}

// ─── 2. COMPANIES ────────────────────────────────────────────────────────────

async function runCompanySync() {
  console.log('\n════════════════════════════════');
  console.log(' STEP 2 — Companies');
  console.log('════════════════════════════════');

  const [rows] = await q('SELECT id, nom FROM entreprises ORDER BY id ASC');
  console.log(`\n── Entreprises: ${rows.length} rows`);

  const results = [];
  for (const row of rows) {
    try {
      const axonautId = await syncEntreprise(row.id);
      console.log(`  [OK] ${row.nom}  →  company #${axonautId}`);
      results.push({ id: row.id, nom: row.nom, axonautId });
    } catch (err) {
      console.error(`  [ERR] ${row.nom}: ${err.message}`);
      results.push({ id: row.id, nom: row.nom, error: err.message });
    }
  }

  const errors = results.filter(r => r.error);
  console.log(`\n  Total: ${results.length}  (${results.filter(r => !r.error).length} OK, ${errors.length} err)`);
  return errors;
}

// ─── 3. COMMANDES ────────────────────────────────────────────────────────────

async function runCommandeSync() {
  console.log('\n════════════════════════════════');
  console.log(' STEP 3 — Commandes BC1 + BC2');
  console.log('════════════════════════════════');

  const [bc1Rows] = await q(
    'SELECT id FROM commande1s WHERE valide = 1 AND axonaut_invoice_id IS NULL'
  );
  const [bc2Rows] = await q(
    'SELECT id FROM commande2s WHERE valide = 1 AND axonaut_invoice_id IS NULL'
  );

  console.log(`\n── BC1 pending: ${bc1Rows.length}`);
  const bc1Results = [];
  for (const { id } of bc1Rows) {
    try {
      const axonautId = await syncBC1(id);
      console.log(`  [OK] BC1 #${id}  →  invoice #${axonautId}`);
      bc1Results.push({ id, axonautId });
    } catch (err) {
      console.error(`  [ERR] BC1 #${id}: ${err.message}`);
      bc1Results.push({ id, error: err.message });
    }
  }

  console.log(`\n── BC2 pending: ${bc2Rows.length}`);
  const bc2Results = [];
  for (const { id } of bc2Rows) {
    try {
      const axonautId = await syncBC2(id);
      console.log(`  [OK] BC2 #${id}  →  invoice #${axonautId}`);
      bc2Results.push({ id, axonautId });
    } catch (err) {
      console.error(`  [ERR] BC2 #${id}: ${err.message}`);
      bc2Results.push({ id, error: err.message });
    }
  }

  console.log(`\n  BC1: ${bc1Results.length}  (${bc1Results.filter(r => !r.error).length} OK, ${bc1Results.filter(r => r.error).length} err)`);
  console.log(`  BC2: ${bc2Results.length}  (${bc2Results.filter(r => !r.error).length} OK, ${bc2Results.filter(r => r.error).length} err)`);
  return [...bc1Results, ...bc2Results].filter(r => r.error);
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════╗');
  console.log('║   Axonaut full sync — syncAll    ║');
  console.log('╚══════════════════════════════════╝');

  const catalogErrors  = await runCatalogSync();
  const companyErrors  = await runCompanySync();
  //const commandeErrors = await runCommandeSync();

  const allErrors = [...catalogErrors, ...companyErrors];

  console.log('\n╔══════════════════════════════════╗');
  console.log('║           Final summary          ║');
  console.log('╚══════════════════════════════════╝');

  if (allErrors.length === 0) {
    console.log('  All done — no errors.');
  } else {
    console.error(`  ${allErrors.length} error(s):`);
    allErrors.forEach(e => {
      const label = e.nom || e.name || `id=${e.id}`;
      console.error(`    - ${label}: ${e.error}`);
    });
    process.exit(1);
  }

  process.exit(0);
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
