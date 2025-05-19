export interface Commande1 {
  id: number;
  entreprise_id: number;
  pack1_id?: number | null;
  reduc_pct: number;
  reduc_lin?: number | null;
  valide: boolean;
  total_ht_avt_remise?: number | null;
  total_ht: number;
  created: Date;
  modified: Date;
  validation_lieu: string | null;
}
export interface Commande1Option {
  id?: number;               // Optional for creation
  commande1_id: number;
  option1_id: number;
  qty: number;
}
