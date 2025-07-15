import jsPDF from 'jspdf';
import { MaturityLevel, MaturityCategory } from '@/data/maturityData';

// Cores do tema (convertidas para RGB)
const colors = {
  primary: [79, 70, 229] as const,
  secondary: [147, 51, 234] as const,
  accent: [59, 130, 246] as const,
  success: [34, 197, 94] as const,
  warning: [251, 191, 36] as const,
  error: [239, 68, 68] as const,
  text: [15, 23, 42] as const,
  textMuted: [100, 116, 139] as const,
  background: [248, 250, 252] as const,
  white: [255, 255, 255] as const
};

function drawRadarChart(
  doc: jsPDF, 
  scores: Record<string, number>, 
  categories: MaturityCategory[], 
  x: number, 
  y: number, 
  radius: number
) {
  const centerX = x + radius;
  const centerY = y + radius;
  const numCategories = categories.length;
  
  // Desenhar círculos concêntricos (níveis 1-5)
  for (let level = 1; level <= 5; level++) {
    const levelRadius = (radius * level) / 5;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.circle(centerX, centerY, levelRadius, 'S');
    
    // Adicionar labels dos níveis
    if (level === 5) {
      doc.setFontSize(8);
      doc.setTextColor(...colors.textMuted);
      doc.text(level.toString(), centerX + levelRadius + 2, centerY + 1);
    }
  }
  
  // Desenhar linhas dos eixos
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.5);
  
  const points: { x: number; y: number; label: string; score: number }[] = [];
  
  categories.forEach((category, index) => {
    const angle = (index * 2 * Math.PI) / numCategories - Math.PI / 2;
    const endX = centerX + radius * Math.cos(angle);
    const endY = centerY + radius * Math.sin(angle);
    
    // Linha do eixo
    doc.line(centerX, centerY, endX, endY);
    
    // Ponto dos dados
    const score = scores[category.id] || 0;
    const dataRadius = (radius * score) / 5;
    const dataX = centerX + dataRadius * Math.cos(angle);
    const dataY = centerY + dataRadius * Math.sin(angle);
    
    points.push({ x: dataX, y: dataY, label: category.name, score });
    
    // Labels das categorias
    const labelDistance = radius + 15;
    const labelX = centerX + labelDistance * Math.cos(angle);
    const labelY = centerY + labelDistance * Math.sin(angle);
    
    doc.setFontSize(8);
    doc.setTextColor(...colors.text);
    
    // Dividir texto longo em múltiplas linhas
    const words = category.name.split(' ');
    if (words.length > 2) {
      const line1 = words.slice(0, 2).join(' ');
      const line2 = words.slice(2).join(' ');
      doc.text(line1, labelX - 10, labelY - 2, { align: 'center' });
      doc.text(line2, labelX - 10, labelY + 3, { align: 'center' });
    } else {
      doc.text(category.name, labelX - 10, labelY, { align: 'center' });
    }
  });
  
  // Desenhar linhas conectando os pontos
  if (points.length > 0) {
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(2);
    for (let i = 0; i < points.length; i++) {
      const current = points[i];
      const next = points[(i + 1) % points.length];
      doc.line(current.x, current.y, next.x, next.y);
    }
    
    // Desenhar pontos
    points.forEach(point => {
      doc.setFillColor(...colors.primary);
      doc.circle(point.x, point.y, 2, 'F');
    });
  }
}

export const generateMaturityReport = (
  scores: Record<string, number>,
  currentLevel: MaturityLevel,
  categories: MaturityCategory[],
  recommendations: Array<{
    category: string;
    currentScore: number;
    suggestion: string;
  }>
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Configurar fontes padrão
  doc.setFont('helvetica');
  
  // === PÁGINA 1: CAPA ===
  
  // Fundo gradient (simulado com retângulos)
  for (let i = 0; i < 50; i++) {
    const alpha = 1 - (i / 50);
    doc.setFillColor(79 + i, 70 + i, 229, alpha * 0.1);
    doc.rect(0, i * 4, pageWidth, 4, 'F');
  }
  
  // Logo/Marca Mastervendas
  doc.setFillColor(...colors.white);
  doc.roundedRect(20, 20, 60, 20, 5, 5, 'F');
  doc.setFontSize(16);
  doc.setTextColor(...colors.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('MASTERVENDAS', 50, 32, { align: 'center' });
  
  // Título principal
  doc.setFontSize(28);
  doc.setTextColor(...colors.white);
  doc.setFont('helvetica', 'bold');
  doc.text('DIAGNÓSTICO DE', pageWidth/2, 80, { align: 'center' });
  doc.text('MATURIDADE EM', pageWidth/2, 95, { align: 'center' });
  doc.text('VENDAS B2B', pageWidth/2, 110, { align: 'center' });
  
  // Subtítulo
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Análise completa do nível de maturidade da sua empresa', pageWidth/2, 130, { align: 'center' });
  
  // Nível atual - Card destacado
  const cardY = 150;
  doc.setFillColor(...colors.white);
  doc.roundedRect(30, cardY, pageWidth - 60, 60, 10, 10, 'F');
  doc.setDrawColor(...colors.primary);
  doc.setLineWidth(2);
  doc.roundedRect(30, cardY, pageWidth - 60, 60, 10, 10, 'S');
  
  doc.setFontSize(16);
  doc.setTextColor(...colors.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('SEU NÍVEL ATUAL', pageWidth/2, cardY + 15, { align: 'center' });
  
  doc.setFontSize(24);
  doc.text(`NÍVEL ${currentLevel.id} - ${currentLevel.name.toUpperCase()}`, pageWidth/2, cardY + 35, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textMuted);
  doc.text(currentLevel.description, pageWidth/2, cardY + 50, { align: 'center' });
  
  // Data do relatório
  doc.setFontSize(10);
  doc.setTextColor(...colors.textMuted);
  doc.text(`Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth/2, 240, { align: 'center' });
  
  // === PÁGINA 2: GRÁFICO DE RADAR E ANÁLISE ===
  doc.addPage();
  
  // Header da página
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, 25, 'F');
  doc.setFontSize(18);
  doc.setTextColor(...colors.white);
  doc.setFont('helvetica', 'bold');
  doc.text('RADAR DE MATURIDADE', pageWidth/2, 17, { align: 'center' });
  
  // Gráfico de Radar
  const radarY = 40;
  drawRadarChart(doc, scores, categories, 20, radarY, 60);
  
  // Legenda do gráfico
  doc.setFontSize(10);
  doc.setTextColor(...colors.textMuted);
  doc.text('Escala: 1 (Iniciante) a 5 (Excelência)', 20, radarY + 140);
  
  // Análise por categoria - lado direito
  const analysisX = 140;
  doc.setFontSize(14);
  doc.setTextColor(...colors.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('ANÁLISE POR CATEGORIA', analysisX, 50);
  
  let currentY = 60;
  categories.slice(0, 5).forEach((category) => {
    const score = scores[category.id] || 0;
    
    // Nome da categoria
    doc.setFontSize(10);
    doc.setTextColor(...colors.text);
    doc.setFont('helvetica', 'bold');
    doc.text(category.name, analysisX, currentY);
    
    // Score
    doc.setFontSize(12);
    doc.setTextColor(...colors.primary);
    doc.text(`${score.toFixed(1)}/5`, analysisX + 45, currentY);
    
    // Barra de progresso
    const barWidth = 20;
    const barHeight = 3;
    doc.setFillColor(220, 220, 220);
    doc.rect(analysisX, currentY + 2, barWidth, barHeight, 'F');
    doc.setFillColor(...colors.primary);
    doc.rect(analysisX, currentY + 2, (barWidth * score) / 5, barHeight, 'F');
    
    currentY += 15;
  });
  
  // Segunda coluna de categorias
  if (categories.length > 5) {
    currentY = 60;
    categories.slice(5).forEach((category) => {
      const score = scores[category.id] || 0;
      
      doc.setFontSize(10);
      doc.setTextColor(...colors.text);
      doc.setFont('helvetica', 'bold');
      doc.text(category.name, analysisX, currentY + 80);
      
      doc.setFontSize(12);
      doc.setTextColor(...colors.primary);
      doc.text(`${score.toFixed(1)}/5`, analysisX + 45, currentY + 80);
      
      const barWidth = 20;
      const barHeight = 3;
      doc.setFillColor(220, 220, 220);
      doc.rect(analysisX, currentY + 82, barWidth, barHeight, 'F');
      doc.setFillColor(...colors.primary);
      doc.rect(analysisX, currentY + 82, (barWidth * score) / 5, barHeight, 'F');
      
      currentY += 15;
    });
  }
  
  // Impacto na eficiência - Box destacado
  const impactY = 160;
  doc.setFillColor(34, 197, 94, 0.1); // Success color with opacity
  doc.roundedRect(20, impactY, pageWidth - 40, 60, 5, 5, 'F');
  doc.setDrawColor(...colors.success);
  doc.setLineWidth(1);
  doc.roundedRect(20, impactY, pageWidth - 40, 60, 5, 5, 'S');
  
  doc.setFontSize(14);
  doc.setTextColor(...colors.success);
  doc.setFont('helvetica', 'bold');
  doc.text('IMPACTO NA EFICIÊNCIA DE VENDAS', pageWidth/2, impactY + 15, { align: 'center' });
  
  doc.setFontSize(20);
  doc.text(`${currentLevel.salesEfficiency}x`, pageWidth/2 - 30, impactY + 35, { align: 'center' });
  doc.text(`${currentLevel.revenueIncrease}`, pageWidth/2 + 30, impactY + 35, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(...colors.textMuted);
  doc.text('Multiplicador de Eficiência', pageWidth/2 - 30, impactY + 45, { align: 'center' });
  doc.text('Aumento de Receita', pageWidth/2 + 30, impactY + 45, { align: 'center' });
  
  // === PÁGINA 3: RECOMENDAÇÕES ===
  doc.addPage();
  
  // Header
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, 25, 'F');
  doc.setFontSize(18);
  doc.setTextColor(...colors.white);
  doc.setFont('helvetica', 'bold');
  doc.text('RECOMENDAÇÕES PARA EVOLUÇÃO', pageWidth/2, 17, { align: 'center' });
  
  currentY = 45;
  recommendations.forEach((rec, index) => {
    // Card da recomendação
    const cardHeight = 40;
    doc.setFillColor(248, 250, 252); // Light background
    doc.roundedRect(20, currentY, pageWidth - 40, cardHeight, 5, 5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(20, currentY, pageWidth - 40, cardHeight, 5, 5, 'S');
    
    // Número da recomendação
    doc.setFillColor(...colors.primary);
    doc.circle(30, currentY + 10, 5, 'F');
    doc.setFontSize(10);
    doc.setTextColor(...colors.white);
    doc.setFont('helvetica', 'bold');
    doc.text((index + 1).toString(), 30, currentY + 12, { align: 'center' });
    
    // Título da categoria
    doc.setFontSize(12);
    doc.setTextColor(...colors.primary);
    doc.setFont('helvetica', 'bold');
    doc.text(rec.category, 40, currentY + 12);
    
    // Score atual
    doc.setFontSize(10);
    doc.setTextColor(...colors.textMuted);
    doc.text(`Score atual: ${rec.currentScore.toFixed(1)}/5`, 40, currentY + 22);
    
    // Sugestão
    doc.setFontSize(9);
    doc.setTextColor(...colors.text);
    doc.setFont('helvetica', 'normal');
    const suggestion = doc.splitTextToSize(rec.suggestion, pageWidth - 80);
    doc.text(suggestion, 40, currentY + 30);
    
    currentY += 50;
  });
  
  // === PÁGINA 4: CALL TO ACTION ===
  doc.addPage();
  
  // Background gradient
  for (let i = 0; i < 50; i++) {
    const alpha = (i / 50) * 0.1;
    doc.setFillColor(79 + i, 70 + i * 2, 229, alpha);
    doc.rect(0, i * 4, pageWidth, 4, 'F');
  }
  
  // Título principal
  doc.setFontSize(24);
  doc.setTextColor(...colors.white);
  doc.setFont('helvetica', 'bold');
  doc.text('PRONTO PARA EVOLUIR', pageWidth/2, 80, { align: 'center' });
  doc.text('AO PRÓXIMO NÍVEL?', pageWidth/2, 100, { align: 'center' });
  
  // Card de contato
  doc.setFillColor(...colors.white);
  doc.roundedRect(30, 120, pageWidth - 60, 80, 10, 10, 'F');
  
  doc.setFontSize(16);
  doc.setTextColor(...colors.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('A MASTERVENDAS pode ajudar sua empresa', pageWidth/2, 140, { align: 'center' });
  doc.text('a alcançar a excelência em vendas B2B', pageWidth/2, 155, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(...colors.text);
  doc.setFont('helvetica', 'normal');
  doc.text('Entre em contato conosco e descubra como podemos', pageWidth/2, 175, { align: 'center' });
  doc.text('acelerar a evolução da sua área de vendas', pageWidth/2, 185, { align: 'center' });
  
  // Informações de contato
  doc.setFontSize(10);
  doc.setTextColor(...colors.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('📧 contato@mastervendas.com.br', pageWidth/2, 220, { align: 'center' });
  doc.text('📱 (11) 99999-9999', pageWidth/2, 235, { align: 'center' });
  doc.text('🌐 www.mastervendas.com.br', pageWidth/2, 250, { align: 'center' });
  
  return doc;
};