import jsPDF from 'jspdf';
import { MaturityLevel, MaturityCategory } from '@/data/maturityData';

// Cores baseadas na identidade visual da Mastervendas (tons teal/turquesa)
const colors = {
  primary: [37, 99, 108] as const,        // Azul-acinzentado escuro
  accent: [0, 150, 136] as const,         // Teal principal da marca
  accentLight: [77, 182, 172] as const,  // Teal mais claro
  accentDark: [0, 121, 107] as const,    // Teal mais escuro
  success: [76, 175, 80] as const,       // Verde suave
  warning: [255, 193, 7] as const,       // Amarelo suave
  error: [244, 67, 54] as const,         // Vermelho suave
  text: [33, 37, 41] as const,           // Cinza escuro
  textMuted: [108, 117, 125] as const,   // Cinza médio
  background: [248, 249, 250] as const,  // Cinza muito claro
  white: [255, 255, 255] as const,
  gray: [220, 220, 220] as const,
  lightGray: [245, 245, 245] as const
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
      doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
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
    
    // Labels das categorias - posicionamento mais próximo do gráfico
    const labelDistance = radius + 8; // Reduzido para ficar mais próximo
    const labelX = centerX + labelDistance * Math.cos(angle);
    const labelY = centerY + labelDistance * Math.sin(angle);
    
    doc.setFontSize(6);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFont('helvetica', 'normal');
    
    // Simplificar quebra de texto - máximo 2 linhas
    const maxCharsPerLine = 10;
    const words = category.name.split(' ');
    let line1 = '';
    let line2 = '';
    
    // Primeira linha
    for (let i = 0; i < words.length; i++) {
      const testLine = line1 + (line1 ? ' ' : '') + words[i];
      if (testLine.length <= maxCharsPerLine) {
        line1 = testLine;
      } else {
        // Restante vai para segunda linha
        line2 = words.slice(i).join(' ');
        if (line2.length > maxCharsPerLine) {
          line2 = line2.substring(0, maxCharsPerLine - 3) + '...';
        }
        break;
      }
    }
    
    // Posicionamento mais inteligente baseado na posição no círculo
    let textAlign: 'left' | 'center' | 'right' = 'center';
    let offsetX = 0;
    let offsetY = 0;
    
    // Ajustar posição baseado no ângulo
    if (Math.abs(labelX - centerX) < 5) {
      // Posições verticais (topo/baixo)
      textAlign = 'center';
      offsetY = labelY > centerY ? 3 : -8;
    } else if (labelX > centerX) {
      // Lado direito
      textAlign = 'left';
      offsetX = 2;
      offsetY = -2;
    } else {
      // Lado esquerdo
      textAlign = 'right';
      offsetX = -2;
      offsetY = -2;
    }
    
    // Desenhar as linhas de texto
    doc.text(line1, labelX + offsetX, labelY + offsetY, { align: textAlign });
    if (line2) {
      doc.text(line2, labelX + offsetX, labelY + offsetY + 6, { align: textAlign });
    }
  });
  
  // Desenhar linhas conectando os pontos
  if (points.length > 0) {
    doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.setLineWidth(2);
    for (let i = 0; i < points.length; i++) {
      const current = points[i];
      const next = points[(i + 1) % points.length];
      doc.line(current.x, current.y, next.x, next.y);
    }
    
    // Desenhar pontos
    points.forEach(point => {
      doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
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
  
  // Fundo gradient suave (cores da Mastervendas)
  doc.setFillColor(colors.background[0], colors.background[1], colors.background[2]);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Fundo limpo sem elementos decorativos
  
  // Logo Mastervendas - área mais ampla para a logo real
  const logoWidth = 120;
  const logoHeight = 45;
  const logoX = pageWidth/2 - logoWidth/2;
  const logoY = 20;
  
  // Fundo branco para a logo
  doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.roundedRect(logoX, logoY, logoWidth, logoHeight, 10, 10, 'F');
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setLineWidth(1.5);
  doc.roundedRect(logoX, logoY, logoWidth, logoHeight, 10, 10, 'S');
  
  // Reproduzir o design da logo Mastervendas
  const funnelX = logoX + 20;
  const funnelY = logoY + 12;
  
  // Desenhar funil (símbolo da logo)
  const funnelLevels = [
    { width: 16, color: colors.accentLight },
    { width: 13, color: colors.accent },
    { width: 10, color: colors.accentDark },
    { width: 7, color: colors.primary }
  ];
  
  funnelLevels.forEach((level, index) => {
    doc.setFillColor(level.color[0], level.color[1], level.color[2]);
    doc.roundedRect(funnelX - level.width/2, funnelY + index * 4.5, level.width, 3, 1, 1, 'F');
  });
  
  // Texto MASTERVENDAS
  doc.setFontSize(16);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('MASTERVENDAS', funnelX + 25, funnelY + 8);
  
  doc.setFontSize(7);
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('EXCELÊNCIA EM VENDAS', funnelX + 25, funnelY + 18);
  
  // Título principal com fonte menor
  doc.setFontSize(22);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('DIAGNÓSTICO DE', pageWidth/2, 100, { align: 'center' });
  doc.text('MATURIDADE EM', pageWidth/2, 120, { align: 'center' });
  doc.text('VENDAS B2B', pageWidth/2, 140, { align: 'center' });
  
  // Subtítulo
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
  doc.text('Análise completa do nível de maturidade da sua empresa', pageWidth/2, 155, { align: 'center' });
  
  // Nível atual - Card com cores suaves
  const cardY = 180;
  doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.roundedRect(25, cardY, pageWidth - 50, 65, 12, 12, 'F');
  
  // Card interno branco
  doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.roundedRect(30, cardY + 5, pageWidth - 60, 55, 8, 8, 'F');
  
  doc.setFontSize(14);
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('SEU NÍVEL ATUAL', pageWidth/2, cardY + 18, { align: 'center' });
  
  doc.setFontSize(18);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text(`NÍVEL ${currentLevel.id} - ${currentLevel.name.toUpperCase()}`, pageWidth/2, cardY + 35, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
  const description = doc.splitTextToSize(currentLevel.description, pageWidth - 80);
  doc.text(description, pageWidth/2, cardY + 50, { align: 'center' });
  
  // Data do relatório
  doc.setFontSize(9);
  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
  doc.text(`Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth/2, 270, { align: 'center' });
  
  // === PÁGINA 2: GRÁFICO DE RADAR E ANÁLISE ===
  doc.addPage();
  
  // Header da página com fonte menor
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, 0, pageWidth, 25, 'F');
  doc.setFontSize(16);
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('RADAR DE MATURIDADE', pageWidth/2, 17, { align: 'center' });
  
  // Fundo para o gráfico mais compacto
  doc.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
  doc.roundedRect(15, 35, 90, 100, 8, 8, 'F');
  
  // Gráfico de Radar com melhor espaçamento para labels
  const radarY = 40;
  const radarRadius = 30; // Reduzido para dar mais espaço aos labels
  drawRadarChart(doc, scores, categories, 25, radarY, radarRadius);
  
  // Legenda do gráfico
  doc.setFontSize(9);
  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
  doc.setFont('helvetica', 'italic');
  doc.text('Estrutura Organizacional', 20, 40);
  
  // Análise por categoria - lado direito com fontes menores
  const analysisX = 115;
  doc.setFontSize(12);
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('ANÁLISE POR CATEGORIA', analysisX, 40);
  
  let currentY = 50;
  categories.forEach((category, index) => {
    const score = scores[category.id] || 0;
    
    // Background alternado mais compacto
    if (index % 2 === 0) {
      doc.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
      doc.rect(analysisX - 5, currentY - 6, 85, 10, 'F');
    }
    
    // Nome da categoria menor
    doc.setFontSize(8);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFont('helvetica', 'bold');
    const categoryName = category.name.length > 18 ? 
      category.name.substring(0, 18) + '...' : category.name;
    doc.text(categoryName, analysisX, currentY);
    
    // Score menor
    doc.setFontSize(9);
    doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(`${score.toFixed(1)}/5`, analysisX + 55, currentY);
    
    // Barra de progresso menor
    const barWidth = 20;
    const barHeight = 3;
    doc.setFillColor(colors.gray[0], colors.gray[1], colors.gray[2]);
    doc.roundedRect(analysisX, currentY + 1, barWidth, barHeight, 1, 1, 'F');
    doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.roundedRect(analysisX, currentY + 1, (barWidth * score) / 5, barHeight, 1, 1, 'F');
    
    currentY += 11;
  });
  
  // Box de impacto mais compacto
  const impactY = 150;
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.roundedRect(15, impactY, pageWidth - 30, 40, 8, 8, 'F');
  
  // Fundo interno para destacar
  doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.roundedRect(20, impactY + 3, pageWidth - 40, 34, 6, 6, 'F');
  
  doc.setFontSize(11);
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('IMPACTO NA EFICIÊNCIA DE VENDAS', pageWidth/2, impactY + 15, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text(`${currentLevel.salesEfficiency}x`, pageWidth/2 - 30, impactY + 28, { align: 'center' });
  doc.text(`${currentLevel.revenueIncrease}`, pageWidth/2 + 30, impactY + 28, { align: 'center' });
  
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255, 0.9);
  doc.text('Multiplicador de Eficiência', pageWidth/2 - 30, impactY + 35, { align: 'center' });
  doc.text('Aumento de Receita', pageWidth/2 + 30, impactY + 35, { align: 'center' });
  
  // === PÁGINA 3: RECOMENDAÇÕES ===
  doc.addPage();
  
  // Header
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, 0, pageWidth, 25, 'F');
  doc.setFontSize(18);
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
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
    doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.circle(30, currentY + 10, 5, 'F');
    doc.setFontSize(10);
    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setFont('helvetica', 'bold');
    doc.text((index + 1).toString(), 30, currentY + 12, { align: 'center' });
    
    // Título da categoria
    doc.setFontSize(12);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(rec.category, 40, currentY + 12);
    
    // Score atual
    doc.setFontSize(10);
    doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
    doc.text(`Score atual: ${rec.currentScore.toFixed(1)}/5`, 40, currentY + 22);
    
    // Sugestão
    doc.setFontSize(9);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFont('helvetica', 'normal');
    const suggestion = doc.splitTextToSize(rec.suggestion, pageWidth - 80);
    doc.text(suggestion, 40, currentY + 30);
    
    currentY += 50;
  });
  
  // === PÁGINA 4: CALL TO ACTION ===
  doc.addPage();
  
  // Background gradient
  doc.setFillColor(colors.background[0], colors.background[1], colors.background[2]);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Título principal
  doc.setFontSize(24);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('PRONTO PARA EVOLUIR', pageWidth/2, 80, { align: 'center' });
  doc.text('AO PRÓXIMO NÍVEL?', pageWidth/2, 100, { align: 'center' });
  
  // Card de contato
  doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.roundedRect(30, 120, pageWidth - 60, 80, 10, 10, 'F');
  
  doc.setFontSize(16);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('A MASTERVENDAS pode ajudar sua empresa', pageWidth/2, 140, { align: 'center' });
  doc.text('a alcançar a excelência em vendas B2B', pageWidth/2, 155, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('Entre em contato conosco e descubra como podemos', pageWidth/2, 175, { align: 'center' });
  doc.text('acelerar a evolução da sua área de vendas', pageWidth/2, 185, { align: 'center' });
  
  // Informações de contato
  doc.setFontSize(10);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('📧 contato@mastervendas.com.br', pageWidth/2, 220, { align: 'center' });
  doc.text('📱 (11) 99999-9999', pageWidth/2, 235, { align: 'center' });
  doc.text('🌐 www.mastervendas.com.br', pageWidth/2, 250, { align: 'center' });
  
  return doc;
};