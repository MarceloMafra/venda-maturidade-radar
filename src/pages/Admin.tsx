import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Download, Eye, Phone, Mail, Building, User, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

interface LeadWithResult extends Lead {
  maturity_result?: MaturityResult;
}

export default function Admin() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<LeadWithResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLead, setSelectedLead] = useState<LeadWithResult | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      
      // Buscar leads
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (leadsError) {
        toast.error("Erro ao carregar leads");
        return;
      }

      // Buscar resultados de maturidade
      const { data: resultsData, error: resultsError } = await supabase
        .from('maturity_results')
        .select('*');

      if (resultsError) {
        console.error("Erro ao carregar resultados:", resultsError);
      }

      // Combinar dados
      const leadsWithResults = leadsData?.map(lead => ({
        ...lead,
        maturity_result: resultsData?.find(result => result.lead_id === lead.id)
      })) || [];

      setLeads(leadsWithResults);
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro inesperado ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead => 
    lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.empresa.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    const csvData = filteredLeads.map(lead => ({
      Nome: lead.nome,
      Email: lead.email,
      Empresa: lead.empresa,
      Cargo: lead.cargo,
      Telefone: lead.telefone,
      'Data Cadastro': format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
      'Score Geral': lead.maturity_result?.overall_score?.toFixed(1) || 'N/A',
      'Nível Maturidade': lead.maturity_result?.maturity_level || 'N/A'
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();

    toast.success("Dados exportados com sucesso!");
  };

  const handleClearAllData = async () => {
    const confirmDelete = window.confirm(
      `⚠️ Tem certeza que deseja deletar TODOS os ${leads.length} leads?\n\nEsta ação é irreversível e vai deletar também:\n- Respostas do questionário\n- Resultados de maturidade\n\nDigite "SIM" para confirmar.`
    );

    if (!confirmDelete) return;

    const userInput = prompt("Digite 'SIM' para confirmar a exclusão de todos os dados:");

    if (userInput !== "SIM") {
      toast.error("Exclusão cancelada");
      return;
    }

    try {
      setLoading(true);

      // Deletar todos os leads (isso vai deletar em cascata respostas e resultados)
      const { error } = await supabase
        .from('leads')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) {
        toast.error("Erro ao deletar dados");
        return;
      }

      toast.success("Todos os dados foram deletados com sucesso!");
      await fetchLeads();
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro inesperado ao deletar dados");
    } finally {
      setLoading(false);
    }
  };

  const getMaturityLevelBadge = (level: number) => {
    const colors = {
      1: "bg-red-500",
      2: "bg-orange-500", 
      3: "bg-yellow-500",
      4: "bg-blue-500",
      5: "bg-green-500"
    };
    
    const labels = {
      1: "Inicial",
      2: "Básico",
      3: "Intermediário", 
      4: "Avançado",
      5: "Otimizado"
    };

    return (
      <Badge className={`text-white ${colors[level as keyof typeof colors] || "bg-gray-500"}`}>
        Nível {level} - {labels[level as keyof typeof labels] || "N/A"}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-lg">Carregando dados...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">
              Dashboard Administrativo
            </h1>
            <p className="text-muted-foreground text-lg">
              Gerencie leads e visualize dados do questionário de maturidade
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="shrink-0"
          >
            Voltar ao App
          </Button>
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total de Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{leads.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Com Resultado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-500">
                {leads.filter(l => l.maturity_result).length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Score Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-500">
                {leads.filter(l => l.maturity_result).length > 0 
                  ? (leads
                      .filter(l => l.maturity_result)
                      .reduce((sum, l) => sum + (l.maturity_result?.overall_score || 0), 0) / 
                     leads.filter(l => l.maturity_result).length).toFixed(1)
                  : '0'
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-500">
                {leads.filter(l => 
                  format(new Date(l.created_at), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                ).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Controles */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nome, email ou empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button onClick={exportToCSV} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
          <Button
            onClick={handleClearAllData}
            variant="destructive"
            className="flex items-center gap-2"
            disabled={leads.length === 0}
          >
            <Trash2 className="w-4 h-4" />
            Limpar Todos os Dados
          </Button>
        </div>

        {/* Tabela de Leads */}
        <Card>
          <CardHeader>
            <CardTitle>Leads Cadastrados ({filteredLeads.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.nome}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.empresa}</TableCell>
                      <TableCell>{lead.cargo}</TableCell>
                      <TableCell>{lead.telefone}</TableCell>
                      <TableCell>
                        {format(new Date(lead.created_at), 'dd/MM/yy HH:mm', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {lead.maturity_result ? 
                          getMaturityLevelBadge(lead.maturity_result.maturity_level) :
                          <Badge variant="outline">Sem resultado</Badge>
                        }
                      </TableCell>
                      <TableCell>
                        {lead.maturity_result ? 
                          <Badge variant="secondary">
                            {lead.maturity_result.overall_score.toFixed(1)}
                          </Badge> :
                          <span className="text-muted-foreground">-</span>
                        }
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedLead(lead)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredLeads.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum lead encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de Detalhes do Lead */}
        {selectedLead && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Detalhes do Lead
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedLead(null)}
                  >
                    ✕
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Informações Pessoais */}
                <div>
                  <h3 className="font-semibold mb-3 text-primary">Informações Pessoais</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>Nome:</strong> {selectedLead.nome}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>Email:</strong> {selectedLead.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>Empresa:</strong> {selectedLead.empresa}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        <strong>Cargo:</strong> {selectedLead.cargo}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>Telefone:</strong> {selectedLead.telefone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        <strong>Data:</strong> {format(new Date(selectedLead.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Resultado de Maturidade */}
                {selectedLead.maturity_result && (
                  <div>
                    <h3 className="font-semibold mb-3 text-primary">Resultado de Maturidade</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        {getMaturityLevelBadge(selectedLead.maturity_result.maturity_level)}
                        <Badge variant="secondary">
                          Score: {selectedLead.maturity_result.overall_score.toFixed(1)}/5
                        </Badge>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Scores por Categoria:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {Object.entries(selectedLead.maturity_result.category_scores).map(([category, score]) => (
                            <div key={category} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                              <span className="text-sm capitalize">{category.replace('-', ' ')}</span>
                              <Badge variant="outline">{(score as number).toFixed(1)}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}