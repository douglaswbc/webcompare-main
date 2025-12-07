export interface Provider {
  id: string;
  name: string;
  type: string;
  logo_url: string;
  active?: boolean;
}

export interface Benefit {
  id: string;
  text: string;
  icon: string;
}

export interface Plan {
  id: string;
  name: string;
  download_speed: string;
  upload_speed: string;
  price: number;
  period: string;
  subtitle: string;
  banner_image: string;
  
  // Badge Info
  is_featured?: boolean;
  badge_text?: string;
  badge_icon?: string;
  badge_color_class?: string;
  badge_text_class?: string;

  // Specs
  connection_type: string;
  data_limit: string;
  contract_text: string;
  active?: boolean;
  provider_id?: string;

  // Relacionamentos (Joined)
  providers?: Provider; 
  benefits?: Benefit[];
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

export interface Article {
  id: string;
  created_at: string;
  title: string;
  description: string;
  image_url: string;
  author: string;
  read_time: string;
}

export interface Lead {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  cpf?: string;
  rg?: string;
  plan_id: string;
  address_json?: {
    logradouro?: string;
    numero?: string;
    bairro?: string;
    localidade?: string;
    uf?: string;
    cep?: string;
  };
  // Propriedade vinda do Join
  plans?: {
    name: string;
  };
}