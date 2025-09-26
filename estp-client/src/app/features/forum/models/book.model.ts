export interface Book {
  id?: number;
  entreprise_id: number;
  description?: string;
  nombre_collaborateurs?: number;
  implantation?: string;
  activite?: string;
  slogan?: string;
  site_web?: string;
  logo_url?: string;
  valide_forum?: boolean;
  valide_entreprise?: boolean;
  created_at?: string;
  updated_at?: string;
  entreprise_nom?: string;
  chiffreAff?: string;
  // New fields
  annee_creation?: number;
  profils_recherches?: string;
  methode_recrutement?: string;
  offres_stage_emploi?: string;
  adresse_postale?: string;
  telephone_contact?: string;
  email_recrutement?: string;
}