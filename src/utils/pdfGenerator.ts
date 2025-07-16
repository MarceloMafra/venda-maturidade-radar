import jsPDF from 'jspdf';
import { MaturityLevel, MaturityCategory } from '@/data/maturityData';

// Cores do tema (convertidas para RGB baseadas no design system)
const colors = {
  primary: [30, 37, 54] as const,      // --primary: 222 47% 11%
  accent: [0, 178, 179] as const,      // --accent: 184 100% 45%
  primaryGlow: [255, 220, 104] as const, // --primary-glow: 45 100% 65%
  success: [34, 197, 94] as const,
  warning: [251, 191, 36] as const,
  error: [239, 68, 68] as const,
  text: [15, 23, 42] as const,
  textMuted: [100, 116, 139] as const,
  background: [248, 250, 252] as const,
  white: [255, 255, 255] as const,
  gray: [200, 200, 200] as const,
  lightGray: [240, 240, 240] as const
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
  
  // Fundo gradient (cores do site)
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Elementos decorativos em gradiente
  for (let i = 0; i < 40; i++) {
    const alpha = 0.3 - (i / 100);
    const y = i * 7;
    doc.setFillColor(0, 178, 179, alpha); // accent color
    doc.rect(0, y, pageWidth, 3, 'F');
  }
  
  // Logo Mastervendas (usando a marca visual)
  doc.setFillColor(...colors.white);
  doc.roundedRect(pageWidth/2 - 40, 25, 80, 25, 8, 8, 'F');
  
  // Criar elementos visuais da logo (formato simplificado)
  doc.setFillColor(...colors.accent);
  for (let i = 0; i < 4; i++) {
    const barWidth = 12 - i * 2;
    const barHeight = 3;
    doc.roundedRect(pageWidth/2 - 35 + i * 3, 30 + i * 2, barWidth, barHeight, 1, 1, 'F');
  }
  
  doc.setFontSize(14);
  doc.setTextColor(...colors.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('MASTERVENDAS', pageWidth/2, 43, { align: 'center' });
  
  // Título principal
  doc.setFontSize(30);
  doc.setTextColor(...colors.white);
  doc.setFont('helvetica', 'bold');
  doc.text('DIAGNÓSTICO DE', pageWidth/2, 90, { align: 'center' });
  doc.text('MATURIDADE EM', pageWidth/2, 110, { align: 'center' });
  doc.text('VENDAS B2B', pageWidth/2, 130, { align: 'center' });
  
  // Subtítulo
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255, 0.9);
  doc.text('Análise completa do nível de maturidade da sua empresa', pageWidth/2, 150, { align: 'center' });
  
  // Nível atual - Card destacado com gradiente accent
  const cardY = 170;
  doc.setFillColor(...colors.accent);
  doc.roundedRect(25, cardY, pageWidth - 50, 70, 15, 15, 'F');
  
  // Card interno branco
  doc.setFillColor(...colors.white);
  doc.roundedRect(30, cardY + 5, pageWidth - 60, 60, 10, 10, 'F');
  
  doc.setFontSize(16);
  doc.setTextColor(...colors.accent);
  doc.setFont('helvetica', 'bold');
  doc.text('SEU NÍVEL ATUAL', pageWidth/2, cardY + 20, { align: 'center' });
  
  doc.setFontSize(22);
  doc.setTextColor(...colors.primary);
  doc.text(`NÍVEL ${currentLevel.id} - ${currentLevel.name.toUpperCase()}`, pageWidth/2, cardY + 40, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textMuted);
  const description = doc.splitTextToSize(currentLevel.description, pageWidth - 80);
  doc.text(description, pageWidth/2, cardY + 55, { align: 'center' });
  
  // Data do relatório
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255, 0.8);
  doc.text(`Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth/2, 270, { align: 'center' });
  
  // === PÁGINA 2: GRÁFICO DE RADAR E ANÁLISE ===
  doc.addPage();
  
  // Header da página
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setFontSize(20);
  doc.setTextColor(...colors.white);
  doc.setFont('helvetica', 'bold');
  doc.text('RADAR DE MATURIDADE', pageWidth/2, 20, { align: 'center' });
  
  // Fundo para o gráfico 
  doc.setFillColor(...colors.lightGray);
  doc.roundedRect(15, 40, 100, 120, 8, 8, 'F');
  
  // Gráfico de Radar melhor dimensionado
  const radarY = 50;
  const radarRadius = 45; // Aumentado para melhor visualização
  drawRadarChart(doc, scores, categories, 20, radarY, radarRadius);
  
  // Legenda do gráfico
  doc.setFontSize(9);
  doc.setTextColor(...colors.textMuted);
  doc.setFont('helvetica', 'italic');
  doc.text('Estrutura Organizacional', 20, 40);
  
  // Análise por categoria - lado direito melhor organizada
  const analysisX = 125;
  doc.setFontSize(16);
  doc.setTextColor(...colors.accent);
  doc.setFont('helvetica', 'bold');
  doc.text('ANÁLISE POR CATEGORIA', analysisX, 50);
  
  let currentY = 65;
  categories.forEach((category, index) => {
    const score = scores[category.id] || 0;
    
    // Background alternado para melhor leitura
    if (index % 2 === 0) {
      doc.setFillColor(...colors.lightGray);
      doc.rect(analysisX - 5, currentY - 8, 85, 12, 'F');
    }
    
    // Nome da categoria (truncado se necessário)
    doc.setFontSize(9);
    doc.setTextColor(...colors.text);
    doc.setFont('helvetica', 'bold');
    const categoryName = category.name.length > 20 ? 
      category.name.substring(0, 20) + '...' : category.name;
    doc.text(categoryName, analysisX, currentY);
    
    // Score destacado
    doc.setFontSize(11);
    doc.setTextColor(...colors.accent);
    doc.setFont('helvetica', 'bold');
    doc.text(`${score.toFixed(1)}/5`, analysisX + 55, currentY);
    
    // Barra de progresso melhorada
    const barWidth = 25;
    const barHeight = 4;
    doc.setFillColor(...colors.gray);
    doc.roundedRect(analysisX, currentY + 1, barWidth, barHeight, 1, 1, 'F');
    doc.setFillColor(...colors.accent);
    doc.roundedRect(analysisX, currentY + 1, (barWidth * score) / 5, barHeight, 1, 1, 'F');
    
    currentY += 13;
  });
  
  // Box de impacto redimensionado e reestilizado
  const impactY = 170;
  doc.setFillColor(...colors.primary);
  doc.roundedRect(15, impactY, pageWidth - 30, 50, 10, 10, 'F');
  
  // Fundo interno verde para destacar
  doc.setFillColor(...colors.accent);
  doc.roundedRect(20, impactY + 5, pageWidth - 40, 40, 8, 8, 'F');
  
  doc.setFontSize(14);
  doc.setTextColor(...colors.white);
  doc.setFont('helvetica', 'bold');
  doc.text('IMPACTO NA EFICIÊNCIA DE VENDAS', pageWidth/2, impactY + 20, { align: 'center' });
  
  doc.setFontSize(18);
  doc.text(`${currentLevel.salesEfficiency}x`, pageWidth/2 - 30, impactY + 35, { align: 'center' });
  doc.text(`${currentLevel.revenueIncrease}`, pageWidth/2 + 30, impactY + 35, { align: 'center' });
  
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255, 0.9);
  doc.text('Multiplicador de Eficiência', pageWidth/2 - 30, impactY + 42, { align: 'center' });
  doc.text('Aumento de Receita', pageWidth/2 + 30, impactY + 42, { align: 'center' });
  
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