import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MaturityRadar } from "@/components/MaturityRadar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Download, Printer, Mail, Phone, Building, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { maturityCategories, maturityLevels } from "@/data/maturityData";

interface Lead {
  id: string;
  nome: string;
  email: string;
  empresa: string;
  cargo: string;
  telefone: string;
  created_at: string;
}

interface MaturityResult {
  id: string;
  lead_id: string;
  overall_score: number;
  maturity_level: number;
  category_scores: Record<string, number>;
  created_at: string;
}

export default function RelatorioRespondente() {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [maturityResult, setMaturityResult] = useState<MaturityResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (leadId) {
      fetchLeadData();
    }
  }, [leadId]);

  const fetchLeadData = async () => {
    try {
      setLoading(true);

      // Buscar lead
      const { data: leadData, error: leadError } = await supabase
        .from("leads")
        .select("*")
        .eq("id", leadId)
        .single();

      if (leadError) {
        toast.error("Lead não encontrado");
        navigate("/admin");
        return;
      }

      // Buscar resultado de maturidade
      const { data: resultData } = await supabase
        .from("maturity_results")
        .select("*")
        .eq("lead_id", leadId)
        .single();

      setLead(leadData);
      if (resultData) {
        setMaturityResult(resultData);
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const getMaturityLevelBadge = (level: number) => {
    const colors: Record<number, string> = {
      1: "bg-red-500",
      2: "bg-orange-500",
      3: "bg-yellow-500",
      4: "bg-blue-500",
      5: "bg-green-500",
    };

    const labels: Record<number, string> = {
      1: "Inicial",
      2: "Básico",
      3: "Intermediário",
      4: "Avançado",
      5: "Otimizado",
    };

    return (
      <Badge className={`text-white text-lg px-4 py-2 ${colors[level] || "bg-gray-500"}`}>
        Nível {level} - {labels[level] || "N/A"}
      </Badge>
    );
  };

  const getFollowupRecommendations = () => {
    if (!maturityResult) return [];

    const level = maturityResult.maturity_level;
    const recommendations: Record<number, string[]> = {
      1: [
        "Agendar reunião executiva para apresentar roadmap de transformação",
        "Propor diagnóstico aprofundado com workshop interno",
        "Apresentar cases de sucesso de empresas similares",
        "Oferecer consultoria estratégica inicial",
      ],
      2: [
        "Apresentar plano de implementação estruturado",
        "Propor mentoria contínua para equipe de vendas",
        "Sugerir integração de ferramentas de CRM",
        "Oferecer treinamento especializado",
      ],
      3: [
        "Focar em otimização de processos existentes",
        "Propor implementação de analytics avançado",
        "Sugerir automação de tarefas operacionais",
        "Oferecer consultoria em escalabilidade",
      ],
      4: [
        "Apresentar estratégias de inovação e diferenciação",
        "Propor programa de excelência em vendas",
        "Sugerir transformação digital completa",
        "Oferecer partnership estratégico",
      ],
      5: [
        "Posicionar como referência de mercado",
        "Propor programa de retenção e desenvolvimento de talentos",
        "Sugerir expansão para novos mercados",
        "Oferecer consultoria em liderança e inovação",
      ],
    };

    return recommendations[level] || [];
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    if (lead) {
      const message = `Olá ${lead.nome}! Tudo bem? Vimos seu resultado no diagnóstico de maturidade em vendas B2B e gostaria de conversar sobre oportunidades para sua empresa.`;
      const encodedMessage = encodeURIComponent(message);
      window.open(
        `https://wa.me/${lead.telefone.replace(/\D/g, "")}?text=${encodedMessage}`,
        "_blank"
      );
    }
  };

  const handleEmail = () => {
    if (lead) {
      const subject = `Seu Resultado - Diagnóstico de Maturidade em Vendas B2B`;
      const body = `Olá ${lead.nome},\n\nSeu diagnóstico foi concluído! Veja o resultado em: [LINK]\n\nGostaria de conversar sobre oportunidades para sua empresa.`;
      window.location.href = `mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <p className="text-lg">Carregando relatório...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <p className="text-lg text-red-500">Lead não encontrado</p>
            <Button onClick={() => navigate("/admin")} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Admin
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentLevel = maturityLevels.find(
    (level) => level.id === maturityResult?.maturity_level
  );
  const followupRecommendations = getFollowupRecommendations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4 print:p-0">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 print:mb-4">
          <div className="flex items-center justify-between mb-4 print:hidden">
            <Button variant="ghost" onClick={() => navigate("/admin")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Admin
            </Button>
            <div className="flex gap-2">
              <Button onClick={handlePrint} variant="outline" className="gap-2">
                <Printer className="w-4 h-4" />
                Imprimir
              </Button>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-primary mb-2">
            Relatório de Maturidade em Vendas B2B
          </h1>
          <p className="text-muted-foreground">
            Respondente: <strong>{lead.nome}</strong>
          </p>
        </div>

        {/* Dados do Respondente */}
        <Card className="mb-8 print:shadow-none print:border-gray-300">
          <CardHeader>
            <CardTitle>Dados do Respondente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-semibold">{lead.nome}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{lead.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Empresa</p>
                  <p className="font-semibold">{lead.empresa}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Cargo:</span>
                <p className="font-semibold">{lead.cargo}</p>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-semibold">{lead.telefone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Data:</span>
                <p className="font-semibold">
                  {format(new Date(lead.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultado de Maturidade */}
        {maturityResult ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Gráfico */}
              <Card className="print:shadow-none print:border-gray-300">
                <CardHeader>
                  <CardTitle className="text-center">Radar de Maturidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <MaturityRadar
                    scores={maturityResult.category_scores}
                    categories={maturityCategories}
                  />
                </CardContent>
              </Card>

              {/* Nível Atual */}
              <Card className="print:shadow-none print:border-gray-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Nível Atual
                    {currentLevel && getMaturityLevelBadge(maturityResult.maturity_level)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentLevel && (
                    <>
                      <div>
                        <h3 className="text-xl font-semibold text-primary mb-2">
                          {currentLevel.name}
                        </h3>
                        <p className="text-muted-foreground mb-4">{currentLevel.description}</p>
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
                        <h4 className="font-semibold text-success mb-2">Impacto na Eficiência:</h4>
                        <div className="flex gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-success">
                              {currentLevel.salesEfficiency}x
                            </div>
                            <div className="text-xs text-muted-foreground">Multiplicador</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-success">
                              +{currentLevel.revenueIncrease}
                            </div>
                            <div className="text-xs text-muted-foreground">Aumento de Receita</div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Scores por Categoria */}
            <Card className="mb-8 print:shadow-none print:border-gray-300">
              <CardHeader>
                <CardTitle>Scores por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(maturityResult.category_scores).map(([categoryId, score]) => {
                    const category = maturityCategories.find((c) => c.id === categoryId);
                    const scoreNum = typeof score === "number" ? score : 0;
                    const percentage = (scoreNum / 5) * 100;

                    return (
                      <div key={categoryId} className="p-4 border rounded-lg bg-background/50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm capitalize">
                            {category?.name || categoryId.replace("-", " ")}
                          </h4>
                          <Badge variant="outline">{scoreNum.toFixed(1)}/5</Badge>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-gradient-primary h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recomendações de Followup Comercial */}
            <Card className="mb-8 print:shadow-none print:border-gray-300 bg-gradient-primary text-primary-foreground">
              <CardHeader>
                <CardTitle>Recomendações de Followup Comercial</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {followupRecommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="p-4 bg-white/10 rounded-lg border border-white/20 print:bg-gray-100 print:border-gray-300 print:text-gray-800"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0 print:bg-gray-300 print:text-gray-800">
                          <span className="text-sm font-bold">{index + 1}</span>
                        </div>
                        <p className="text-sm">{rec}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ações de Contato */}
            <div className="flex flex-col sm:flex-row gap-4 print:hidden">
              <Button onClick={handleWhatsApp} className="gap-2 flex-1">
                <Phone className="w-4 h-4" />
                Contatar por WhatsApp
              </Button>
              <Button onClick={handleEmail} variant="outline" className="gap-2 flex-1">
                <Mail className="w-4 h-4" />
                Enviar por Email
              </Button>
            </div>
          </>
        ) : (
          <Card className="print:shadow-none print:border-gray-300">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground text-lg">
                Esse respondente ainda não completou o questionário.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
