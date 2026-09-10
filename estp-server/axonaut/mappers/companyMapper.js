// axonaut/mappers/companyMapper.js
// Maps an entreprise row (+ optional secteur name) to an Axonaut company payload.

function toAxonautCompany(entreprise, secteurNom = null) {
  return {
    // Le client Axonaut porte le nom de la SOCIÉTÉ (pas le nom de facturation /
    // de la RH, qui est un contact). On garde fct_nom en dernier recours si le
    // nom de la société venait à manquer.
    name: entreprise.nom || entreprise.fct_nom,
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
