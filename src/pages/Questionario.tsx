import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { QuestionCard } from "@/components/QuestionCard";
import { maturityCategories } from "@/data/maturityData";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Questionario() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const allQuestions = maturityCategories.flatMap(category => 
    category.questions.map(question => ({
      ...question,
      categoryName: category.name,
      categoryId: category.id
    }))
  );

  const currentQuestionData = allQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / allQuestions.length) * 100;

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionData.id]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < allQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Calcular scores e navegar para resultados
      const scores = calculateScores();
      navigate('/resultado', { state: { scores, answers } });
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateScores = () => {
    const scores: Record<string, number> = {};
    
    maturityCategories.forEach(category => {
      const categoryAnswers = category.questions.map(q => {
        const answer = answers[q.id];
        return answer ? parseInt(answer) : 0;
      });
      
      const averageScore = categoryAnswers.reduce((sum, score) => sum + score, 0) / categoryAnswers.length;
      scores[category.id] = averageScore;
    });

    return scores;
  };

  const canProceed = answers[currentQuestionData?.id];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-primary">
              Diagnóstico de Maturidade em Vendas B2B
            </h1>
            <div className="text-sm text-muted-foreground">
              {currentQuestion + 1} de {allQuestions.length}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        {currentQuestionData && (
          <div className="mb-8 animate-fade-in">
            <QuestionCard
              question={currentQuestionData}
              value={answers[currentQuestionData.id] || ""}
              onChange={handleAnswer}
              categoryName={currentQuestionData.categoryName}
            />
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="flex items-center gap-2"
            variant="hero"
          >
            {currentQuestion < allQuestions.length - 1 ? (
              <>
                Próxima
                <ChevronRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Ver Resultado
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}