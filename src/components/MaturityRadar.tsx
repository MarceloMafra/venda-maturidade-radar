import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface RadarData {
  category: string;
  score: number;
  fullMark: 5;
}

interface MaturityRadarProps {
  scores: Record<string, number>;
  categories: Array<{ id: string; name: string }>;
}

export function MaturityRadar({ scores, categories }: MaturityRadarProps) {
  const data: RadarData[] = categories.map(category => ({
    category: category.name.split(' ').slice(0, 2).join(' '), // Encurta o nome para caber melhor
    score: scores[category.id] || 0,
    fullMark: 5
  }));

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <PolarGrid 
            stroke="hsl(var(--border))" 
            strokeWidth={1}
            gridType="polygon"
          />
          <PolarAngleAxis 
            dataKey="category" 
            tick={{ 
              fontSize: 12, 
              fill: 'hsl(var(--foreground))',
              fontWeight: 500
            }}
            tickSize={8}
          />
          <PolarRadiusAxis 
            angle={90}
            domain={[0, 5]}
            tick={{ 
              fontSize: 10, 
              fill: 'hsl(var(--muted-foreground))'
            }}
            tickCount={6}
            axisLine={false}
          />
          <Radar
            name="Nível de Maturidade"
            dataKey="score"
            stroke="hsl(var(--accent))"
            strokeWidth={3}
            fill="hsl(var(--accent))"
            fillOpacity={0.1}
            dot={{
              fill: 'hsl(var(--accent))',
              strokeWidth: 2,
              stroke: 'hsl(var(--background))',
              r: 4
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}