// src/app/models/commande1.model.ts

export class Commande1 {
    id: number;
    entreprise_id: number;
    contact_principal_id: number;
    date_commande: string;
    statut_commande: string;
    options: Commande1Option[];
  
    constructor(
      id: number,
      entreprise_id: number,
      contact_principal_id: number,
      date_commande: string,
      statut_commande: string,
      options: Commande1Option[]
    ) {
      this.id = id;
      this.entreprise_id = entreprise_id;
      this.contact_principal_id = contact_principal_id;
      this.date_commande = date_commande;
      this.statut_commande = statut_commande;
      this.options = options
    }
  }
// src/app/models/commande1-option.model.ts

export class Commande1Option {
    id: number;
    commande1_id: number;
    option1_id: number;
    qty: number;
  
    constructor(id: number, commande1_id: number, option1_id: number, qty: number) {
      this.id = id;
      this.commande1_id = commande1_id;
      this.option1_id = option1_id;
      this.qty = qty;
    }
  }
    