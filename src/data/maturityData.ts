export interface MaturityLevel {
  id: number;
  name: string;
  description: string;
  color: string;
  characteristics: string[];
  salesEfficiency: number;
  revenueIncrease: string;
}

export interface MaturityCategory {
  id: string;
  name: string;
  description: string;
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
}

export interface Option {
  value: number;
  text: string;
  level: number;
}

export const maturityLevels: MaturityLevel[] = [
  {
    id: 1,
    name: "Caos Operacional",
    description: "Falta governança nos processos comerciais, equipe de vendas opera de maneira descoordenada",
    color: "hsl(var(--nivel-1))",
    characteristics: [
      "Processos não documentados",
      "Métricas inexistentes ou irrelevantes",
      "Cultura reativa e desorganizada",
      "Falta de estratégias definidas"
    ],
    salesEfficiency: 1.0,
    revenueIncrease: "0%"
  },
  {
    id: 2,
    name: "Organização Inicial",
    description: "Processos iniciais de vendas estabelecidos, adoção crescente de ferramentas básicas",
    color: "hsl(var(--nivel-2))",
    characteristics: [
      "Implementação de CRMs básicos",
      "Primeiros indícios de segmentação",
      "Cultura em transição",
      "Métricas básicas implementadas"
    ],
    salesEfficiency: 1.25,
    revenueIncrease: "25%"
  },
  {
    id: 3,
    name: "Estruturação e Consistência",
    description: "Processos estabelecidos e documentados, métricas e KPIs básicos em uso",
    color: "hsl(var(--nivel-3))",
    characteristics: [
      "Processos documentados",
      "Cultura data-driven iniciante",
      "Coordenação entre vendas e marketing",
      "Ciclo de vendas definido"
    ],
    salesEfficiency: 1.6,
    revenueIncrease: "60%"
  },
  {
    id: 4,
    name: "Otimização e Previsibilidade",
    description: "Operações guiadas por métricas bem definidas, ferramentas tecnológicas robustas",
    color: "hsl(var(--nivel-4))",
    characteristics: [
      "Funil de vendas bem definido",
      "Previsibilidade alta",
      "Cultura orientada para desempenho",
      "Coordenação forte entre áreas"
    ],
    salesEfficiency: 2.0,
    revenueIncrease: "100%"
  },
  {
    id: 5,
    name: "Excelência",
    description: "Operações otimizadas, cultura de inovação e melhoria contínua estabelecida",
    color: "hsl(var(--nivel-5))",
    characteristics: [
      "Inovação e melhoria contínua",
      "Cultura organizacional de alto nível",
      "Processos otimizados",
      "Liderança estratégica"
    ],
    salesEfficiency: 2.5,
    revenueIncrease: "150%"
  }
];

export const maturityCategories: MaturityCategory[] = [
  {
    id: "estrutura-organizacional",
    name: "Estrutura Organizacional",
    description: "Organização e definição de papéis na equipe de vendas",
    questions: [
      {
        id: "estrutura-1",
        text: "Como está organizada a estrutura da sua equipe de vendas?",
        options: [
          { value: 1, text: "Sem estrutura definida, cada vendedor atua individualmente", level: 1 },
          { value: 2, text: "Estrutura básica com alguns papéis definidos", level: 2 },
          { value: 3, text: "Estrutura clara com papéis e responsabilidades bem definidos", level: 3 },
          { value: 4, text: "Estrutura otimizada com especialização por segmento/produto", level: 4 },
          { value: 5, text: "Estrutura de alta performance com times especializados e liderança estratégica", level: 5 }
        ]
      }
    ]
  },
  {
    id: "documentacao-governanca",
    name: "Documentação e Governança",
    description: "Processos documentados e governança estabelecida",
    questions: [
      {
        id: "doc-1",
        text: "Qual o nível de documentação dos seus processos de vendas?",
        options: [
          { value: 1, text: "Processos não documentados, conhecimento tribal", level: 1 },
          { value: 2, text: "Alguns processos documentados de forma básica", level: 2 },
          { value: 3, text: "Processos principais documentados e atualizados regularmente", level: 3 },
          { value: 4, text: "Processos detalhados com métricas e indicadores associados", level: 4 },
          { value: 5, text: "Documentação completa com governança e melhoria contínua", level: 5 }
        ]
      }
    ]
  },
  {
    id: "uso-tecnologia",
    name: "Uso de Tecnologia",
    description: "Adoção e utilização de ferramentas tecnológicas",
    questions: [
      {
        id: "tech-1",
        text: "Como sua empresa utiliza tecnologia no processo de vendas?",
        options: [
          { value: 1, text: "Uso básico ou inexistente de tecnologia", level: 1 },
          { value: 2, text: "CRM básico implementado, uso limitado", level: 2 },
          { value: 3, text: "CRM implementado com boa adoção da equipe", level: 3 },
          { value: 4, text: "Ferramentas integradas: CRM, automação, analytics", level: 4 },
          { value: 5, text: "Stack tecnológico completo com IA e automação avançada", level: 5 }
        ]
      }
    ]
  },
  {
    id: "treinamento-desenvolvimento",
    name: "Treinamento e Desenvolvimento",
    description: "Capacitação e desenvolvimento da equipe",
    questions: [
      {
        id: "train-1",
        text: "Como funciona o treinamento da sua equipe de vendas?",
        options: [
          { value: 1, text: "Não há programa de treinamento estruturado", level: 1 },
          { value: 2, text: "Treinamentos pontuais e básicos", level: 2 },
          { value: 3, text: "Programa de treinamento estruturado e regular", level: 3 },
          { value: 4, text: "Desenvolvimento contínuo com trilhas personalizadas", level: 4 },
          { value: 5, text: "Academia de vendas com metodologia própria e certificações", level: 5 }
        ]
      }
    ]
  },
  {
    id: "metricas-kpis",
    name: "Métricas e KPIs",
    description: "Uso de métricas e indicadores de performance",
    questions: [
      {
        id: "metrics-1",
        text: "Como sua empresa monitora as métricas de vendas?",
        options: [
          { value: 1, text: "Métricas básicas ou não utilizadas", level: 1 },
          { value: 2, text: "Algumas métricas básicas acompanhadas", level: 2 },
          { value: 3, text: "KPIs definidos e acompanhados regularmente", level: 3 },
          { value: 4, text: "Métricas avançadas com análise preditiva", level: 4 },
          { value: 5, text: "Dashboard completo com insights estratégicos em tempo real", level: 5 }
        ]
      }
    ]
  },
  {
    id: "previsibilidade-vendas",
    name: "Previsibilidade de Vendas",
    description: "Capacidade de prever e planejar vendas",
    questions: [
      {
        id: "forecast-1",
        text: "Como é realizada a previsão de vendas na sua empresa?",
        options: [
          { value: 1, text: "Não há previsibilidade, vendas são imprevisíveis", level: 1 },
          { value: 2, text: "Previsões básicas baseadas em intuição", level: 2 },
          { value: 3, text: "Previsões estruturadas com base em pipeline", level: 3 },
          { value: 4, text: "Previsões precisas com alta confiabilidade", level: 4 },
          { value: 5, text: "Previsões estratégicas com cenários e planejamento de longo prazo", level: 5 }
        ]
      }
    ]
  },
  {
    id: "alinhamento-estrategico",
    name: "Alinhamento Estratégico",
    description: "Alinhamento entre vendas e estratégia empresarial",
    questions: [
      {
        id: "strategy-1",
        text: "Como as vendas estão alinhadas com a estratégia da empresa?",
        options: [
          { value: 1, text: "Vendas operam isoladamente da estratégia", level: 1 },
          { value: 2, text: "Alinhamento básico com objetivos gerais", level: 2 },
          { value: 3, text: "Vendas alinhadas com estratégia e objetivos claros", level: 3 },
          { value: 4, text: "Integração estratégica com outras áreas", level: 4 },
          { value: 5, text: "Vendas como driver estratégico da empresa", level: 5 }
        ]
      }
    ]
  },
  {
    id: "retencao-cultura",
    name: "Retenção e Cultura",
    description: "Cultura organizacional e retenção de talentos",
    questions: [
      {
        id: "culture-1",
        text: "Como é a cultura e retenção na sua equipe de vendas?",
        options: [
          { value: 1, text: "Alta rotatividade, cultura tóxica ou inexistente", level: 1 },
          { value: 2, text: "Cultura em desenvolvimento, rotatividade controlada", level: 2 },
          { value: 3, text: "Cultura positiva estabelecida, boa retenção", level: 3 },
          { value: 4, text: "Cultura de alta performance, baixa rotatividade", level: 4 },
          { value: 5, text: "Cultura de excelência, empresa referência no mercado", level: 5 }
        ]
      }
    ]
  },
  {
    id: "eficiencia-operacional",
    name: "Eficiência Operacional",
    description: "Eficiência dos processos operacionais",
    questions: [
      {
        id: "efficiency-1",
        text: "Como você avalia a eficiência operacional das vendas?",
        options: [
          { value: 1, text: "Processos ineficientes, muito tempo perdido", level: 1 },
          { value: 2, text: "Eficiência básica, ainda há muito desperdício", level: 2 },
          { value: 3, text: "Processos eficientes com otimizações pontuais", level: 3 },
          { value: 4, text: "Alta eficiência com processos otimizados", level: 4 },
          { value: 5, text: "Excelência operacional com melhoria contínua", level: 5 }
        ]
      }
    ]
  },
  {
    id: "inovacao-melhoria",
    name: "Inovação e Melhoria Contínua",
    description: "Capacidade de inovar e melhorar continuamente",
    questions: [
      {
        id: "innovation-1",
        text: "Como sua empresa inova e melhora os processos de vendas?",
        options: [
          { value: 1, text: "Não há cultura de inovação ou melhoria", level: 1 },
          { value: 2, text: "Melhorias pontuais quando surgem problemas", level: 2 },
          { value: 3, text: "Processo estruturado de melhoria contínua", level: 3 },
          { value: 4, text: "Inovação como parte da cultura empresarial", level: 4 },
          { value: 5, text: "Liderança em inovação, empresa referência no setor", level: 5 }
        ]
      }
    ]
  }
];