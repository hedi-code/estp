// axonaut/mappers/companyMapper.js
// Maps an entreprise row (+ optional secteur name) to an Axonaut company payload.

function toAxonautCompany(entreprise, secteurNom = null) {
  return {
    name: entreprise.fct_nom || entreprise.nom,
    registration_number: entreprise.siren || '',
    // Billing address takes priority over postal address
    address: entreprise.fct_adresse || entreprise.adresse || '',
    phone: entreprise.telephone_standard || '',
    website: entreprise.siteweb || '',
    activity_sector: secteurNom || '',
    // All clients are B2B companies
    is_customer: true,
    type: 'company',
  };
}

module.exports = { toAxonautCompany };
