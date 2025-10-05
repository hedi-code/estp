export interface Entreprise {
    id?: number | undefined;
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
    commercial?: string;
    place_plan?: string | null;
    // Contact information (loaded dynamically)
    contact_nom?: string;
    contact_email?: string;
    contact_telephone?: string;
    contact_fonction?: string;
  }

export interface EntrepriseWithPack1 extends Entreprise {
    commande1_id?: number;
    pack1_id?: number;
    total_ht?: number;
    valide?: number;
    pack_id?: number;
    pack1_titre?: string;
    pack1_description?: string;
    surface_id?: number;
    surface?: number;
    surface_prix?: number;
  }