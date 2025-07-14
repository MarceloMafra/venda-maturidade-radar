import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Question } from "@/data/maturityData";

interface QuestionCardProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  categoryName: string;
}

export function QuestionCard({ question, value, onChange, categoryName }: QuestionCardProps) {
  return (
    <Card className="bg-gradient-card shadow-elegant animate-scale-in">
      <CardHeader>
        <CardTitle className="text-lg text-primary">
          {categoryName}
        </CardTitle>
        <p className="text-muted-foreground">{question.text}</p>
      </CardHeader>
      <CardContent>
        <RadioGroup value={value} onValueChange={onChange} className="space-y-3">
          {question.options.map((option) => (
            <div key={option.value} className="flex items-start space-x-3">
              <RadioGroupItem 
                value={option.value.toString()} 
                id={`${question.id}-${option.value}`}
                className="mt-1"
              />
              <Label 
                htmlFor={`${question.id}-${option.value}`}
                className="text-sm leading-5 cursor-pointer flex-1"
              >
                <span className={`inline-block w-6 h-6 rounded-full mr-2 text-xs text-white font-bold flex items-center justify-center`}
                      style={{ backgroundColor: `hsl(var(--nivel-${option.level}))` }}>
                  {option.level}
                </span>
                {option.text}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}