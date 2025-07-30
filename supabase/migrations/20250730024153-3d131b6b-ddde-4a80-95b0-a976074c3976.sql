-- Criar tabela para leads/respondentes
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  empresa TEXT,
  cargo TEXT,
  telefone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para respostas do questionário
CREATE TABLE public.questionario_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  answer_value TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para resultados/scores finais
CREATE TABLE public.maturity_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  overall_score NUMERIC NOT NULL,
  maturity_level INTEGER NOT NULL,
  category_scores JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionario_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maturity_results ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS (temporariamente permissivas para desenvolvimento)
-- Estas devem ser restringidas quando a autenticação for implementada
CREATE POLICY "Allow all operations for development" 
ON public.leads 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations for development" 
ON public.questionario_responses 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations for development" 
ON public.maturity_results 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índices para melhor performance
CREATE INDEX idx_questionario_responses_lead_id ON public.questionario_responses(lead_id);
CREATE INDEX idx_maturity_results_lead_id ON public.maturity_results(lead_id);
CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);