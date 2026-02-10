import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MaturityRadar } from "@/components/MaturityRadar";
import { LeadCaptureForm } from "@/components/LeadCaptureForm";
import { maturityCategories, maturityLevels } from "@/data/maturityData";
import { ArrowLeft, Download, MessageCircle } from "lucide-react";
import { generateMaturityReport } from "@/utils/pdfGenerator";
import { useToast } from "@/hooks/use-toast";

export default function Resultado() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showLeadForm, setShowLeadForm] = useState(false);

  // Safely extract scores and answers from location state
  const scores = location.state?.scores as Record<string, number> | undefined;
  const answers = location.state?.answers as Record<string, string> | undefined;

  if (!scores) {
    navigate('/');
    return null;
  }

  const overallScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.values(scores).length;
  const currentLevel = maturityLevels.find(level => level.id === Math.round(overallScore)) || maturityLevels[0];
  const nextLevel = maturityLevels.find(level => level.id === Math.round(overallScore) + 1);

  const getRecommendations = () => {
    const recommendations = [];
    
    // Se o nível de maturidade for 5, mostrar mensagem especial
    if (Math.round(overallScore) === 5) {
      recommendations.push({
        category: "Parabéns! Excelência Alcançada",
        currentScore: 5,
        suggestion: "Sua empresa atingiu o mais alto nível de maturidade em vendas B2B! Continue mantendo este padrão de excelência para consolidar sua posição como líder de mercado e referência no setor."
      });
      return recommendations;
    }
    
    // Encontrar as categorias com menor pontuação
    const sortedCategories = Object.entries(scores)
      .sort(([,a], [,b]) => a - b)
      .slice(0, 3);

    sortedCategories.forEach(([categoryId, score]) => {
      const category = maturityCategories.find(c => c.id === categoryId);
      if (category && score < 4) {
        recommendations.push({
          category: category.name,
          currentScore: score,
          suggestion: getImprovementSuggestion(categoryId, score)
        });
      }
    });

    return recommendations;
  };

  const getImprovementSuggestion = (categoryId: string, score: number) => {
    const suggestions = {
      'estrutura-organizacional': [
        'Defina papéis e responsabilidades claros na equipe',
        'Implemente estrutura hierárquica adequada',
        'Especialize vendedores por segmento ou produto'
      ],
      'documentacao-governanca': [
        'Documente todos os processos de vendas',
        'Estabeleça métricas e indicadores de performance',
        'Implemente governança e controles regulares'
      ],
      'uso-tecnologia': [
        'Implemente um CRM robusto',
        'Integre ferramentas de automação',
        'Adote analytics avançados e IA'
      ],
      'treinamento-desenvolvimento': [
        'Estruture programa de capacitação contínua',
        'Desenvolva trilhas de aprendizado personalizadas',
        'Crie academia interna de vendas'
      ],
      'metricas-kpis': [
        'Defina KPIs essenciais de vendas',
        'Implemente dashboards em tempo real',
        'Use análise preditiva para tomada de decisões'
      ],
      'previsibilidade-vendas': [
        'Estruture pipeline de vendas consistente',
        'Implemente forecasting baseado em dados',
        'Desenvolva cenários e planejamento estratégico'
      ],
      'alinhamento-estrategico': [
        'Alinhe vendas com objetivos empresariais',
        'Integre vendas com outras áreas',
        'Torne vendas driver estratégico da empresa'
      ],
      'retencao-cultura': [
        'Desenvolva cultura de alta performance',
        'Implemente programas de retenção',
        'Torne-se referência no mercado'
      ],
      'eficiencia-operacional': [
        'Otimize processos operacionais',
        'Elimine desperdícios e gargalos',
        'Implemente melhoria contínua'
      ],
      'inovacao-melhoria': [
        'Fomente cultura de inovação',
        'Implemente processos de melhoria contínua',
        'Torne-se líder em inovação no setor'
      ]
    };

    const categorySuggestions = suggestions[categoryId as keyof typeof suggestions] || [];
    const suggestionIndex = Math.min(Math.floor(score), categorySuggestions.length - 1);
    return categorySuggestions[suggestionIndex] || 'Continue melhorando os processos existentes';
  };

  const recommendations = getRecommendations();

  const handleDownloadRequest = () => {
    setShowLeadForm(true);
  };

  const handleLeadSubmit = async (leadData: any) => {
    try {
      // Aqui você pode salvar os dados do lead se necessário
      console.log('Dados do lead:', leadData);

      // Gerar e baixar o PDF
      const pdf = await generateMaturityReport(scores, currentLevel, maturityCategories, recommendations);
      pdf.save(`Relatorio-Maturidade-Vendas-B2B-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Relatório baixado com sucesso!",
        description: "O arquivo PDF foi salvo em seu dispositivo.",
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro ao gerar relatório",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao início
          </Button>
          
          <h1 className="text-4xl font-bold text-primary mb-2">
            Seu Diagnóstico de Maturidade
          </h1>
          <p className="text-muted-foreground text-lg">
            Análise completa do nível de maturidade em vendas B2B da sua empresa
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gráfico de Radar */}
          <Card className="bg-gradient-card shadow-elegant">
            <CardHeader>
              <CardTitle className="text-center">Radar de Maturidade</CardTitle>
            </CardHeader>
            <CardContent>
              <MaturityRadar scores={scores} categories={maturityCategories} />
            </CardContent>
          </Card>

          {/* Nível Atual */}
          <Card className="bg-gradient-card shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Nível Atual de Maturidade
                <Badge 
                  className="text-white font-bold"
                  style={{ backgroundColor: currentLevel.color }}
                >
                  Nível {currentLevel.id}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-primary mb-2">
                  {currentLevel.name}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {currentLevel.description}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Características principais:</h4>
                <ul className="space-y-1">
                  {currentLevel.characteristics.map((char, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center">
                      <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                      {char}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 p-4 bg-success/10 rounded-lg border border-success/20">
                <h4 className="font-semibold text-success mb-2">Impacto na Eficiência de Vendas:</h4>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">{currentLevel.salesEfficiency}x</div>
                    <div className="text-xs text-muted-foreground">Multiplicador de Eficiência</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">+{currentLevel.revenueIncrease}</div>
                    <div className="text-xs text-muted-foreground">Aumento de Receita</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Empresas neste nível de maturidade demonstram <strong>{currentLevel.salesEfficiency}x mais eficiência</strong> em processos de vendas e <strong>{currentLevel.revenueIncrease} de aumento na receita</strong> comparado ao nível inicial.
                </p>
              </div>

              {nextLevel && (
                <div className="mt-6 p-4 bg-accent/10 rounded-lg">
                  <h4 className="font-semibold text-accent mb-2">Próximo nível:</h4>
                  <p className="text-sm text-muted-foreground">
                    <strong>{nextLevel.name}</strong> - {nextLevel.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recomendações */}
        <Card className="mt-8 bg-gradient-card shadow-elegant">
          <CardHeader>
            <CardTitle>
              {Math.round(overallScore) === 5 ? "Parabéns pela Excelência!" : "Recomendações para Evolução"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Math.round(overallScore) === 5 ? (
              <div className="text-center py-8">
                <div className="mb-6">
                  <div className="text-6xl mb-4">🏆</div>
                  <h3 className="text-2xl font-bold text-primary mb-4">
                    Excelência em Vendas B2B Alcançada!
                  </h3>
                  <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                    Sua empresa atingiu o mais alto nível de maturidade em vendas B2B! 
                    Parabéns por construir uma operação de vendas de classe mundial.
                  </p>
                  <div className="p-6 bg-success/10 rounded-lg border border-success/20 max-w-2xl mx-auto">
                    <h4 className="font-semibold text-success mb-3">Foco na Liderança de Mercado</h4>
                    <p className="text-muted-foreground">
                      Continue mantendo este padrão de excelência para consolidar sua posição como 
                      <strong> líder de mercado</strong> e <strong>referência no setor</strong>. 
                      Sua operação de vendas está preparada para escalar e dominar novos mercados.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((rec, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-background/50">
                    <h4 className="font-semibold text-primary mb-2">{rec.category}</h4>
                    <div className="mb-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Score atual:</span>
                        <Badge variant="outline">{rec.currentScore.toFixed(1)}/5</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.suggestion}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="mt-8 bg-gradient-primary text-primary-foreground shadow-glow">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Pronto para evoluir ao próximo nível?
            </h2>
            <p className="text-lg mb-6 opacity-90">
              A <strong>Mastervendas</strong> pode ajudar sua empresa a alcançar a excelência em vendas B2B
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary" 
                className="text-primary"
                onClick={() => window.open('https://wa.me/5543991049976?text=Olá! Vi o relatório de maturidade em vendas B2B e gostaria de falar com um especialista.', '_blank')}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Falar com Especialista
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-primary"
                onClick={handleDownloadRequest}
              >
                <Download className="w-5 h-5 mr-2" />
                Baixar Relatório Completo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Formulário de Captura de Lead */}
        <LeadCaptureForm
          isOpen={showLeadForm}
          onClose={() => setShowLeadForm(false)}
          onSubmit={handleLeadSubmit}
          answers={answers || {}}
          scores={scores}
        />
      </div>
    </div>
  );
}