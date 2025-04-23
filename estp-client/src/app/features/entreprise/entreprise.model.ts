export interface Entreprise {
    id?: number;
    contact_principal_id?: number;
    user_id?: number;
    commercial_id?: number;
    secteur_id?: number;
    nom: string;
    logo?: string;
    siren: string;
    adresse?: string;
    created?: string;
    modified?: string;
    telephone_standard?: string;
    telephone_fax?: string;
    siteweb?: string;
    fct_adresse?: string;
    fct_nom?: string;
    has_participated?: number;
    activity?: number;
  }