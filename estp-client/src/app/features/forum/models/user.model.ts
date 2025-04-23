export interface User {
    id: number;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: string;
    created: string;
    modified: string;
    last_login?: string;
    step: number;
    verified: boolean;
  }
  