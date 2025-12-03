export interface Provider {
  id: string;
  name: string;
  type: string;
  logo_url: string;
}

export interface PlanCoverage {
  uf: string;
  city: string | null;
}

export interface Benefit {
  id: string;
  text: string;
  icon: string;
}

export interface Plan {
  id: string;
  name: string;
  download_speed: string; // Mapeado de snake_case do DB
  upload_speed: string;
  price: number;
  period: string;
  subtitle: string;
  banner_image: string;

  // Badge Info (opcionais)
  badge_text?: string;
  badge_icon?: string;
  badge_color_class?: string;
  badge_text_class?: string;

  // Specs
  connection_type: string;
  data_limit: string;
  contract_text: string;

  // Relacionamentos
  providers?: Provider; // Joined do Supabase
  benefits?: Benefit[];

  // UI Flags
  is_featured?: boolean;
}

export interface UserAddress {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  numero: string;
}

export interface UserPersonalData {
  nome: string;
  telefone: string;
  cpf: string;
  rg: string;
}