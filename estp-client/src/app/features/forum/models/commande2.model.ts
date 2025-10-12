export interface Commande2 {
  id: number;
  entreprise_id: number;
  pack2_id?: number | null;
  pack2_color?: string | null;
  reduc_pct?: number;
  remise_pack_plus?: number | null;
  valide: boolean;
  total_ht_avt_remise?: number | null;
  total_ht: number;
  created?: Date;
  modified?: Date;
  standiste_nom?: string | null;
  standiste_prenom?: string | null;
  standiste_entreprise?: string | null;
  standiste_telephone?: string | null;
  standiste_demande?: string | null;
  standiste_status?: number | null;
  validation_lieu?: string | null;
   fct_payee?: boolean;
  fct_envoyee?: boolean;
}

export interface NewCommande2 extends Omit<Commande2, 'id'> {}

export interface Commande2WithDetails extends Commande2 {
  pack_nom?: string;
  pack_coloris?: string;
  pack_prix_ht?: number;
  entreprise_nom?: string;
}

export interface Commande2Option {
  id?: number;
  commande2_id: number;
  option2_id: number;
  qty: number;
  color?: string | null;
  reduction?: number;
  option_nom?: string;
  option_coloris?: string;
  option_prix_ht?: number;
  option_taux_tva?: number;
  option_description?: string;
  option_img?: string;
  option_qmax?: number;
  option_multiple?: boolean;
  category_name?: string;
}

export interface Pack2 {
  id: number;
  nom?: string;
  coloris?: string;
  prix_ht: number;
}

export interface NewPack2 extends Omit<Pack2, 'id'> {}

export interface Option2 {
  id: number;
  category_id?: number | null;
  nom: string;
  coloris?: string | null;
  dispo_si?: string | null;
  img?: string | null;
  prix_ht: number;
  taux_tva: number;
  qmax: number;
  description?: string | null;
  ordre: number;
  multiple: boolean;
  category_name?: string;
  qteCommande?: number;
  colorCommande?: string;
  reductionCommande?: number;
}

export interface NewOption2 extends Omit<Option2, 'id'> {}

export interface Option2Category {
  id: number;
  name: string;
  ordre?: number;
}

export interface NewOption2Category extends Omit<Option2Category, 'id'> {}

export interface Option2CategoryWithOptions extends Option2Category {
  options: Option2[];
}