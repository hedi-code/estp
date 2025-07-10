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
}