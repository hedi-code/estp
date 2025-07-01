export interface Commande1 {
  id: number;
  entreprise_id: number;
  pack1_id?: number | null;
  reduc_pct?: number;
  reduc_lin?: number | null;
  valide: boolean;
  total_ht_avt_remise?: number | null;
  total_ht: number;
  created?: Date;
  modified?: Date;
  validation_lieu?: string | null;
  fct_payee?: boolean;
  fct_envoyee?: boolean;
}
export interface NewCommande1 extends Omit<Commande1, 'id'> {}

export interface Commande1Option {
  id?: number;
  commande1_id: number;
  option1_id: number;
  qty: number;
}
