// axonaut/mappers/invoice1Mapper.js
// Maps a BC1 order + its options to an Axonaut invoice payload.
//
// bc1Data shape:
// {
//   commande  : commande1 row  (id, pack1_id, total_ht, total_ht_avt_remise, reduc_pct, reduc_lin, created)
//   pack      : { titre }      (pack1s row, titre null if no pack selected)
//   surface   : { surface, prix, axonaut_product_id } | null
//   options   : [{ name, prix_ht, qty, axonaut_product_id }]
// }

const DEFAULT_TVA = 20;

function resolveProductId(raw) {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function nonEmptyName(name) {
  return typeof name === 'string' && name.trim().length > 0 ? name.trim() : null;
}

function toAxonautInvoice1(bc1Data, axonautCompanyId) {
  const { commande, pack, surface, options } = bc1Data;

  const products = [];

  // Pack line — only when a pack is actually selected
  if (commande.pack1_id) {
    const surfaceProductId = surface ? resolveProductId(surface.axonaut_product_id) : null;
    if (surfaceProductId) {
      products.push({ id: surfaceProductId, quantity: 1 });
    } else {
      const titre = nonEmptyName(pack.titre);
      const packName = surface && titre
        ? `${titre} – ${surface.surface} m²`
        : titre;
      // Skip the pack line entirely if we have neither a linked product nor a usable name —
      // Axonaut rejects lines that have no id/name/internal_id/product_code.
      if (packName) {
        products.push({
          name: packName,
          price: parseFloat(surface ? surface.prix : commande.total_ht_avt_remise),
          quantity: 1,
          tax_rate: DEFAULT_TVA,
        });
      }
    }
  }

  // Selected BC1 options
  for (const opt of options) {
    const optProductId = resolveProductId(opt.axonaut_product_id);
    if (optProductId) {
      products.push({ id: optProductId, quantity: opt.qty });
    } else {
      const optName = nonEmptyName(opt.name);
      if (optName) {
        products.push({
          name: optName,
          price: parseFloat(opt.prix_ht),
          quantity: opt.qty,
          tax_rate: DEFAULT_TVA,
        });
      }
    }
  }

  // Fixed discount line
  if (commande.reduc_lin && parseFloat(commande.reduc_lin) > 0) {
    products.push({
      name: 'Remise commerciale',
      price: -Math.abs(parseFloat(commande.reduc_lin)),
      quantity: 1,
      tax_rate: DEFAULT_TVA,
    });
  }

  return {
    reference: `BC1-${commande.id}`,
    company_id: axonautCompanyId,
    date: formatDate(commande.created),
    // Percentage discount applied globally on the invoice
    discount_percent: commande.reduc_pct ? parseFloat(commande.reduc_pct) : 0,
    products,
  };
}

function formatDate(d) {
  // RFC3339 without fractional seconds: 2026-05-04T14:23:45Z
  const date = d ? new Date(d) : new Date();
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

module.exports = { toAxonautInvoice1 };
