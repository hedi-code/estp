export interface Contact {
    id?: number;
    user_id?: string;
    nom: string;
    prenom: string;
    email: string;
    telephone1?: string;
    telephone2?: string;
    telephone_fax?: string;
    newsletter?: number;
    fonction?: string;
    standiste: boolean;
    genre?: number;
    created?: string;
    modified?: string;
  }