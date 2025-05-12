export interface Pack {
    pack_id?: number;
    type?: string;
    titre?: string;
    description?: string;
    img?: string;
    surfaces?: { surface_id: number; surface?: number; prix?: string }[];
    options?: { option_id: number; option_description?: string }[];
  }