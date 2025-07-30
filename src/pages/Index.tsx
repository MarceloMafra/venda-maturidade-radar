import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { maturityLevels } from "@/data/maturityData";
import { BarChart, Target, TrendingUp, Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8 animate-fade-in">
            <div className="mb-6">
              <img 
                src="/lovable-uploads/a7c008ff-9d99-4a1f-bda2-9f81d4fb0721.png" 
                alt="Mastervendas Logo" 
                className="h-20 mx-auto object-contain"
              />
            </div>
            <Badge variant="outline" className="mb-4 px-4 py-2 text-sm font-medium">
              Framework Mastervendas
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6 leading-tight">
              Diagnóstico de
              <span className="block bg-gradient-primary bg-clip-text text-transparent">
                Maturidade em Vendas B2B
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Descubra o nível de maturidade da sua empresa em vendas B2B e obtenha um roadmap personalizado 
              para alcançar a excelência comercial
            </p>
          </div>

          <div className="mb-12 animate-scale-in">
            <Button 
              size="hero" 
              variant="hero" 
              onClick={() => navigate('/questionario')}
              className="shadow-glow"
            >
              <Target className="w-6 h-6 mr-2" />
              Iniciar Diagnóstico Gratuito
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
            <Card className="bg-gradient-card shadow-elegant animate-fade-in" style={{animationDelay: '0.2s'}}>
              <CardContent className="p-6 text-center">
                <BarChart className="w-8 h-8 text-accent mx-auto mb-3" />
                <div className="text-2xl font-bold text-primary mb-1">10</div>
                <div className="text-sm text-muted-foreground">Áreas Avaliadas</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-card shadow-elegant animate-fade-in" style={{animationDelay: '0.4s'}}>
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-accent mx-auto mb-3" />
                <div className="text-2xl font-bold text-primary mb-1">5</div>
                <div className="text-sm text-muted-foreground">Níveis de Maturidade</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-card shadow-elegant animate-fade-in" style={{animationDelay: '0.6s'}}>
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-accent mx-auto mb-3" />
                <div className="text-2xl font-bold text-primary mb-1">100%</div>
                <div className="text-sm text-muted-foreground">Personalizado</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Níveis de Maturidade */}
      <section className="px-4 py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Os 5 Níveis de Maturidade
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Entenda onde sua empresa está e para onde pode evoluir no processo de vendas B2B
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {maturityLevels.map((level, index) => (
              <Card 
                key={level.id} 
                className="bg-gradient-card shadow-elegant hover:shadow-glow transition-all duration-300 animate-fade-in"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-3"
                      style={{ backgroundColor: level.color }}
                    >
                      {level.id}
                    </div>
                    <h3 className="font-semibold text-primary text-sm">
                      {level.name}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {level.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-primary text-primary-foreground shadow-glow">
            <CardContent className="p-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Pronto para descobrir o potencial da sua empresa?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Faça o diagnóstico completo e receba um relatório detalhado com 
                recomendações personalizadas para acelerar suas vendas
              </p>
              <Button 
                size="hero" 
                variant="secondary" 
                onClick={() => navigate('/questionario')}
                className="text-primary shadow-elegant"
              >
                <Target className="w-6 h-6 mr-2" />
                Começar Agora - É Grátis
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Link discreto para admin */}
      <div className="fixed bottom-4 left-4">
        <button
          onClick={() => navigate('/admin')}
          className="text-xs text-muted-foreground/50 hover:text-primary transition-colors"
        >
          •
        </button>
      </div>
    </div>
  );
};

export default Index;
