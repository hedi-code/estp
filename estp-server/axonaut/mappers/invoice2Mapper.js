// axonaut/mappers/invoice2Mapper.js
// Maps a BC2 order + its options to an Axonaut invoice payload.
//
// bc2Data shape:
// {
//   commande : commande2 row  (id, pack2_id, pack2_color, reduc_pct, remise_pack_plus, created)
//   pack     : { nom, coloris, prix_ht, axonaut_product_id }
//   options  : [{ nom, prix_ht, taux_tva, qty, color, reduction, axonaut_product_id }]
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

function toAxonautInvoice2(bc2Data, axonautCompanyId) {
  const { commande, pack, options } = bc2Data;

  const products = [];

  // Pack line — when a pack is selected on the commande
  if (commande.pack2_id) {
    const nom = nonEmptyName(pack.nom) || `Pack #${commande.pack2_id}`;
    const packColor = commande.pack2_color || pack.coloris || null;
    const packName = packColor ? `${nom} – ${packColor}` : nom;

    const line = {
      name: packName,
      price: parseFloat(pack.prix_ht) || 0,
      quantity: 1,
      tax_rate: DEFAULT_TVA,
    };
    const packProductId = resolveProductId(pack.axonaut_product_id);
    if (packProductId) line.id = packProductId;
    products.push(line);
  }

  // Remise pack plus (fixed discount on the pack)
  if (commande.remise_pack_plus && parseFloat(commande.remise_pack_plus) > 0) {
    products.push({
      name: 'Remise Pack+',
      price: -Math.abs(parseFloat(commande.remise_pack_plus)),
      quantity: 1,
      tax_rate: DEFAULT_TVA,
    });
  }

  // Selected BC2 options
  // Each option carries its own TVA rate and an optional per-line reduction.
  for (const opt of options) {
    const reduction = parseFloat(opt.reduction || 0);
    const nom = nonEmptyName(opt.nom) || 'Option';
    const name = opt.color ? `${nom} – ${opt.color}` : nom;
    const unitPrice = (parseFloat(opt.prix_ht) || 0) - reduction;

    const line = {
      name,
      price: unitPrice,
      quantity: opt.qty,
      tax_rate: parseFloat(opt.taux_tva) || DEFAULT_TVA,
    };
    const optProductId = resolveProductId(opt.axonaut_product_id);
    if (optProductId) line.id = optProductId;
    products.push(line);
  }

  return {
    reference: `BC2-${commande.id}`,
    company_id: axonautCompanyId,
    date: formatDate(commande.created),
    discount_percent: commande.reduc_pct ? parseFloat(commande.reduc_pct) : 0,
    products,
  };
}

function formatDate(d) {
  // RFC3339 without fractional seconds: 2026-05-04T14:23:45Z
  const date = d ? new Date(d) : new Date();
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

module.exports = { toAxonautInvoice2 };
