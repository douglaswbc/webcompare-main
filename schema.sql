-- ==============================================================================
-- 1. CONFIGURAÇÕES INICIAIS E EXTENSÕES
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. CRIAÇÃO DAS TABELAS
-- ==============================================================================

-- 2.1. PROVIDERS (Provedores)
CREATE TABLE IF NOT EXISTS public.providers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text, -- 'Fibra', 'Satélite', etc.
  logo_url text,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT providers_pkey PRIMARY KEY (id)
);

-- 2.2. PLANS (Planos de Internet)
CREATE TABLE IF NOT EXISTS public.plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL,
  name text NOT NULL,
  price numeric NOT NULL,
  download_speed text,
  upload_speed text,
  period text DEFAULT '/mês'::text,
  subtitle text,
  banner_image text,
  is_featured boolean DEFAULT false,
  -- Badges visuais
  badge_text text,
  badge_icon text,
  badge_color_class text,
  badge_text_class text,
  -- Detalhes técnicos
  connection_type text,
  data_limit text,
  contract_text text,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT plans_pkey PRIMARY KEY (id),
  CONSTRAINT plans_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(id)
);

-- 2.3. BENEFITS (Benefícios do Plano)
CREATE TABLE IF NOT EXISTS public.benefits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL,
  text text NOT NULL,
  icon text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT benefits_pkey PRIMARY KEY (id),
  CONSTRAINT benefits_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON DELETE CASCADE
);

-- 2.4. SERVICEABLE_CEPS (Cobertura por CEP Exato)
CREATE TABLE IF NOT EXISTS public.serviceable_ceps (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  cep text NOT NULL,
  provider_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT serviceable_ceps_pkey PRIMARY KEY (id),
  CONSTRAINT unique_cep_per_provider UNIQUE (cep, provider_id),
  CONSTRAINT serviceable_ceps_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(id)
);

-- 2.5. SERVICEABLE_CITIES (Cobertura Ampla por Cidade)
CREATE TABLE IF NOT EXISTS public.serviceable_cities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  city text NOT NULL,
  uf text NOT NULL,
  provider_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT serviceable_cities_pkey PRIMARY KEY (id),
  CONSTRAINT serviceable_cities_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(id)
);

-- 2.6. COVERAGE_AREAS (Cobertura por Mapa/KML - Corrigido para provider_id)
CREATE TABLE IF NOT EXISTS public.coverage_areas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL,
  area_name text,
  geom geometry, -- Requer PostGIS
  uf text,
  CONSTRAINT coverage_areas_pkey PRIMARY KEY (id),
  CONSTRAINT coverage_areas_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(id)
);

-- 2.7. LEADS (Clientes Interessados)
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  cpf text,
  rg text,
  plan_id uuid,
  address_json jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT leads_pkey PRIMARY KEY (id),
  CONSTRAINT leads_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id)
);

-- 2.8. ARTICLES (Blog)
CREATE TABLE IF NOT EXISTS public.articles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  author text,
  read_time text,
  category text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT articles_pkey PRIMARY KEY (id)
);

-- 2.9. SETTINGS (Configurações Gerais / WhatsApp)
CREATE TABLE IF NOT EXISTS public.settings (
  key text NOT NULL,
  value text,
  description text,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT settings_pkey PRIMARY KEY (key)
);

-- ==============================================================================
-- 3. ÍNDICES DE PERFORMANCE
-- ==============================================================================

-- Índices para Foreign Keys
CREATE INDEX IF NOT EXISTS idx_plans_provider ON public.plans(provider_id);
CREATE INDEX IF NOT EXISTS idx_benefits_plan ON public.benefits(plan_id);
CREATE INDEX IF NOT EXISTS idx_leads_plan ON public.leads(plan_id);

-- Índices para Cobertura
CREATE INDEX IF NOT EXISTS idx_ceps_cep ON public.serviceable_ceps(cep);
CREATE INDEX IF NOT EXISTS idx_ceps_provider ON public.serviceable_ceps(provider_id);

CREATE INDEX IF NOT EXISTS idx_cities_location ON public.serviceable_cities(city, uf);
CREATE INDEX IF NOT EXISTS idx_cities_provider ON public.serviceable_cities(provider_id);

-- Índice Espacial (Crucial para KML)
CREATE INDEX IF NOT EXISTS idx_coverage_areas_geom ON public.coverage_areas USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_coverage_areas_provider ON public.coverage_areas(provider_id);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) - POLÍTICAS DE ACESSO
-- ==============================================================================

ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.serviceable_ceps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.serviceable_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coverage_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura Pública
CREATE POLICY "Public Read Providers" ON public.providers FOR SELECT USING (true);
CREATE POLICY "Public Read Plans" ON public.plans FOR SELECT USING (true);
CREATE POLICY "Public Read Benefits" ON public.benefits FOR SELECT USING (true);
CREATE POLICY "Public Read CEPs" ON public.serviceable_ceps FOR SELECT USING (true);
CREATE POLICY "Public Read Cities" ON public.serviceable_cities FOR SELECT USING (true);
CREATE POLICY "Public Read Areas" ON public.coverage_areas FOR SELECT USING (true);
CREATE POLICY "Public Read Articles" ON public.articles FOR SELECT USING (true);
CREATE POLICY "Public Read Settings" ON public.settings FOR SELECT USING (true);

-- Políticas de Escrita (Admin) - Assume role 'authenticated' como Admin
CREATE POLICY "Admin Full Providers" ON public.providers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Plans" ON public.plans FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Benefits" ON public.benefits FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full CEPs" ON public.serviceable_ceps FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Cities" ON public.serviceable_cities FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Areas" ON public.coverage_areas FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Articles" ON public.articles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Settings" ON public.settings FOR ALL USING (auth.role() = 'authenticated');

-- Políticas Especiais para Leads
CREATE POLICY "Public Create Leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin Read Leads" ON public.leads FOR SELECT USING (auth.role() = 'authenticated');

-- ==============================================================================
-- 5. FUNÇÕES E TRIGGERS
-- ==============================================================================

-- 5.1. Trigger para atualizar 'updated_at' em Settings
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_settings_updated_at ON public.settings;
CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- 5.2. RPC: Busca Inteligente de Planos
CREATE OR REPLACE FUNCTION get_available_plans(
  user_cep text,
  user_lat numeric,
  user_long numeric,
  user_city text,
  user_uf text
)
RETURNS TABLE (
  id uuid,
  provider_id uuid,
  match_type text
)
LANGUAGE plpgsql
AS $$
DECLARE
  norm_city text;
  norm_uf text;
BEGIN
  -- Normaliza inputs
  norm_city := UPPER(UNACCENT(TRIM(user_city)));
  norm_uf := UPPER(TRIM(user_uf));

  RETURN QUERY
  
  -- 1. BUSCA POR CEP EXATO (Prioridade Alta)
  SELECT 
    p.id, 
    p.provider_id, 
    'cep'::text as match_type
  FROM plans p
  JOIN serviceable_ceps sc ON p.provider_id = sc.provider_id
  WHERE 
    REPLACE(REPLACE(sc.cep, '-', ''), '.', '') = REPLACE(REPLACE(user_cep, '-', ''), '.', '')
  AND p.active = true

  UNION

  -- 2. BUSCA POR CIDADE (Cobertura Ampla)
  SELECT 
    p.id, 
    p.provider_id, 
    'city'::text as match_type
  FROM plans p
  JOIN serviceable_cities s_city ON p.provider_id = s_city.provider_id
  WHERE 
    UPPER(UNACCENT(TRIM(s_city.city))) = norm_city 
    AND UPPER(TRIM(s_city.uf)) = norm_uf
  AND p.active = true

  UNION

  -- 3. BUSCA POR MAPA/GEOMETRIA (KML)
  SELECT 
    p.id, 
    p.provider_id, 
    'map'::text as match_type
  FROM plans p
  JOIN coverage_areas ca ON p.provider_id = ca.provider_id
  WHERE 
    user_lat != 0 AND user_long != 0
    AND ST_Contains(ca.geom, ST_SetSRID(ST_MakePoint(user_long, user_lat), 4326))
  AND p.active = true;

END;
$$;

-- ==============================================================================
-- 6. DADOS INICIAIS (SEED)
-- ==============================================================================

-- Configuração padrão do WhatsApp
INSERT INTO public.settings (key, value, description)
VALUES ('whatsapp_contact', '55DD912345678', 'Número principal de atendimento do site')
ON CONFLICT (key) DO NOTHING;