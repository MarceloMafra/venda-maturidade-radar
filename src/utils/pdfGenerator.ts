import jsPDF from 'jspdf';
import { MaturityLevel, MaturityCategory } from '@/data/maturityData';

// Paleta de cores premium
const colors = {
  primary: [20, 77, 91] as const,           // Azul-teal escuro
  accent: [0, 159, 139] as const,           // Teal vibrante
  accentLight: [100, 200, 190] as const,    // Teal claro
  accentDark: [0, 121, 107] as const,       // Teal escuro
  success: [76, 175, 80] as const,          // Verde
  warning: [255, 193, 7] as const,          // Amarelo
  error: [244, 67, 54] as const,            // Vermelho
  text: [33, 37, 41] as const,              // Cinza escuro
  textMuted: [108, 117, 125] as const,      // Cinza médio
  textLight: [155, 165, 175] as const,      // Cinza claro
  background: [248, 250, 252] as const,     // Azul muito claro
  white: [255, 255, 255] as const,
  gray: [220, 225, 230] as const,
  lightGray: [240, 244, 248] as const
};

// Função para desenhar header premium
function drawPremiumHeader(doc: jsPDF, title: string, pageWidth: number, bgColor: typeof colors.primary) {
  doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
  doc.rect(0, 0, pageWidth, 30, 'F');

  // Linha decorativa abaixo
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setLineWidth(3);
  doc.line(0, 30, pageWidth, 30);

  doc.setFontSize(18);
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth / 2, 20, { align: 'center' });
}

// Função para desenhar logo premium com imagem oficial
async function drawPremiumLogo(doc: jsPDF, x: number, y: number) {
  try {
    // Tentar carregar a logo oficial
    const logoImg = new Image();
    logoImg.src = '/logo-mastervendas.png';

    // Usar imagem se disponível, senão usar fallback
    const response = await fetch('/logo-mastervendas.png').catch(() => null);
    if (response && response.ok) {
      const blob = await response.blob();
      const reader = new FileReader();
      await new Promise((resolve) => {
        reader.onload = () => {
          const imgData = reader.result as string;
          doc.addImage(imgData, 'PNG', x, y, 90, 45);
          resolve(null);
        };
        reader.readAsDataURL(blob);
      });
    } else {
      // Fallback: desenhar logo gerada
      drawFallbackLogo(doc, x, y);
    }
  } catch (error) {
    // Fallback se algo der errado
    console.warn('Erro ao carregar logo, usando fallback:', error);
    drawFallbackLogo(doc, x, y);
  }
}

// Logo gerada como fallback
function drawFallbackLogo(doc: jsPDF, x: number, y: number) {
  // Logo background
  doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setLineWidth(2);
  doc.roundedRect(x, y, 90, 45, 6, 6, 'FD');

  // Logo mark - formas modernas
  const markX = x + 12;
  const markY = y + 8;

  // Desenhar um símbolo de vendas moderno (piramide/funil elegante)
  doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);

  // Topo
  doc.rect(markX + 4, markY, 8, 4, 'F');
  // Meio
  doc.rect(markX + 2, markY + 5, 12, 4, 'F');
  // Base
  doc.rect(markX, markY + 10, 16, 4, 'F');

  // Ponto final elegante
  doc.setFillColor(colors.accentDark[0], colors.accentDark[1], colors.accentDark[2]);
  doc.circle(markX + 8, markY + 18, 2, 'F');

  // Texto
  doc.setFontSize(12);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('MASTER', markX + 22, markY + 10);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('VENDAS', markX + 22, markY + 20);

  // Tagline
  doc.setFontSize(6);
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('EXCELÊNCIA EM VENDAS', x + 15, y + 40);
}

// Função para desenhar shadow
function drawShadow(doc: jsPDF, x: number, y: number, w: number, h: number, radius: number) {
  doc.setFillColor(0, 0, 0);
  doc.setGlobalAlpha(0.05);
  doc.roundedRect(x + 1, y + 2, w, h, radius, radius, 'F');
  doc.setGlobalAlpha(1);
}

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

  // Desenhar círculos concêntricos
  for (let level = 1; level <= 5; level++) {
    const levelRadius = (radius * level) / 5;
    doc.setDrawColor(colors.gray[0], colors.gray[1], colors.gray[2]);
    doc.setLineWidth(0.3);
    doc.circle(centerX, centerY, levelRadius, 'S');
  }

  // Desenhar linhas dos eixos
  doc.setDrawColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
  doc.setLineWidth(0.5);

  const points: { x: number; y: number; label: string; score: number }[] = [];

  categories.forEach((category, index) => {
    const angle = (index * 2 * Math.PI) / numCategories - Math.PI / 2;
    const endX = centerX + radius * Math.cos(angle);
    const endY = centerY + radius * Math.sin(angle);

    doc.line(centerX, centerY, endX, endY);

    const score = scores[category.id] || 0;
    const dataRadius = (radius * score) / 5;
    const dataX = centerX + dataRadius * Math.cos(angle);
    const dataY = centerY + dataRadius * Math.sin(angle);

    points.push({ x: dataX, y: dataY, label: category.name, score });

    // Labels
    const labelDistance = radius + 6;
    const labelX = centerX + labelDistance * Math.cos(angle);
    const labelY = centerY + labelDistance * Math.sin(angle);

    doc.setFontSize(9);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFont('helvetica', 'bold');
    doc.text((index + 1).toString(), labelX, labelY, { align: 'center' });
  });

  // Desenhar polígono
  if (points.length > 0) {
    doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.setLineWidth(2.5);
    for (let i = 0; i < points.length; i++) {
      const current = points[i];
      const next = points[(i + 1) % points.length];
      doc.line(current.x, current.y, next.x, next.y);
    }

    // Preenchimento semi-transparente
    doc.setFillColor(colors.accentLight[0], colors.accentLight[1], colors.accentLight[2]);
    doc.setGlobalAlpha(0.3);
    const pathPoints = points.map(p => [p.x, p.y]);
    doc.circle(centerX, centerY, radius, 'F');
    doc.setGlobalAlpha(1);

    // Pontos
    doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    points.forEach(point => {
      doc.circle(point.x, point.y, 2.5, 'F');
    });
  }
}

export const generateMaturityReport = async (
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

  // === PÁGINA 1: CAPA PREMIUM ===

  // Background gradient
  doc.setFillColor(colors.background[0], colors.background[1], colors.background[2]);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Elemento decorativo no topo
  doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setGlobalAlpha(0.08);
  doc.rect(0, 0, pageWidth, 120, 'F');
  doc.setGlobalAlpha(1);

  // Logo
  await drawPremiumLogo(doc, pageWidth / 2 - 45, 15);

  // Título premium
  doc.setFontSize(32);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('DIAGNÓSTICO DE MATURIDADE', pageWidth / 2, 90, { align: 'center' });

  doc.setFontSize(32);
  doc.text('EM VENDAS B2B', pageWidth / 2, 110, { align: 'center' });

  // Subtítulo elegante
  doc.setFontSize(13);
  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('Análise Completa do Nível de Maturidade da sua Empresa', pageWidth / 2, 130, { align: 'center' });

  // Card com resultado - Design premium
  const cardY = 155;
  drawShadow(doc, 20, cardY, pageWidth - 40, 70, 10);

  doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setLineWidth(1.5);
  doc.roundedRect(20, cardY, pageWidth - 40, 70, 10, 10, 'FD');

  // Barra superior colorida
  doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.rect(20, cardY, pageWidth - 40, 4, 'F');

  doc.setFontSize(12);
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('SEU NÍVEL ATUAL', pageWidth / 2, cardY + 18, { align: 'center' });

  doc.setFontSize(20);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(`NÍVEL ${currentLevel.id} • ${currentLevel.name.toUpperCase()}`, pageWidth / 2, cardY + 35, {
    align: 'center',
  });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  const description = doc.splitTextToSize(currentLevel.description, pageWidth - 80);
  doc.text(description, pageWidth / 2, cardY + 50, { align: 'center' });

  // Data e footer
  doc.setFontSize(9);
  doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
  doc.text(`Relatório gerado em ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, pageHeight - 15, {
    align: 'center',
  });

  // === PÁGINA 2: RADAR E ANÁLISE ===
  doc.addPage();

  drawPremiumHeader(doc, 'RADAR DE MATURIDADE', pageWidth, colors.primary);

  // Background sutil
  doc.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
  doc.roundedRect(10, 40, pageWidth - 20, pageHeight - 50, 8, 8, 'F');

  // Área do gráfico
  doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
  drawShadow(doc, 15, 45, 90, 110, 6);
  doc.roundedRect(15, 45, 90, 110, 6, 6, 'F');

  const radarRadius = 32;
  drawRadarChart(doc, scores, categories, 25, 50, radarRadius);

  // Análise por categoria - lado direito
  const analysisX = 115;
  doc.setFontSize(12);
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('ANÁLISE POR CATEGORIA', analysisX, 50);

  let currentY = 58;
  categories.forEach((category, index) => {
    const score = scores[category.id] || 0;

    // Background alternado elegante
    if (index % 2 === 0) {
      doc.setFillColor(colors.background[0], colors.background[1], colors.background[2]);
      doc.rect(analysisX - 3, currentY - 5, pageWidth - analysisX - 17, 9, 'F');
    }

    // Número
    doc.setFontSize(8);
    doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}.`, analysisX, currentY);

    // Nome da categoria
    doc.setFontSize(8);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFont('helvetica', 'normal');
    const categoryName = category.name.length > 18 ? category.name.substring(0, 18) + '...' : category.name;
    doc.text(categoryName, analysisX + 10, currentY);

    // Score
    doc.setFontSize(8);
    doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(`${score.toFixed(1)}/5`, pageWidth - 22, currentY);

    // Barra de progresso elegante
    const barWidth = 15;
    const barHeight = 2.5;
    doc.setFillColor(colors.gray[0], colors.gray[1], colors.gray[2]);
    doc.roundedRect(analysisX + 10, currentY + 2, barWidth, barHeight, 1, 1, 'F');
    doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.roundedRect(analysisX + 10, currentY + 2, (barWidth * score) / 5, barHeight, 1, 1, 'F');

    currentY += 10;
  });

  // Box de impacto - Premium
  const impactY = 175;
  drawShadow(doc, 15, impactY, pageWidth - 30, 50, 8);

  doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.roundedRect(15, impactY, pageWidth - 30, 50, 8, 8, 'F');

  doc.setFontSize(11);
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('IMPACTO NA EFICIÊNCIA DE VENDAS', pageWidth / 2, impactY + 12, { align: 'center' });

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`${currentLevel.salesEfficiency}x`, pageWidth / 2 - 35, impactY + 32, { align: 'center' });
  doc.text(`+${currentLevel.revenueIncrease}`, pageWidth / 2 + 35, impactY + 32, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Multiplicador de\nEficiência', pageWidth / 2 - 35, impactY + 40, { align: 'center' });
  doc.text('Aumento de\nReceita', pageWidth / 2 + 35, impactY + 40, { align: 'center' });

  // === PÁGINA 3: RECOMENDAÇÕES ===
  doc.addPage();

  const isLevel5 = currentLevel.id === 5;
  drawPremiumHeader(
    doc,
    isLevel5 ? 'PARABÉNS PELA EXCELÊNCIA!' : 'RECOMENDAÇÕES PARA EVOLUÇÃO',
    pageWidth,
    colors.primary
  );

  currentY = 50;

  if (isLevel5) {
    // Mensagem especial para nível 5
    drawShadow(doc, 20, currentY + 20, pageWidth - 40, 140, 10);

    doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.setLineWidth(2);
    doc.roundedRect(20, currentY + 20, pageWidth - 40, 140, 10, 10, 'FD');

    // Barra superior
    doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.rect(20, currentY + 20, pageWidth - 40, 5, 'F');

    // Troféu (caractere especial)
    doc.setFontSize(40);
    doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.text('★', pageWidth / 2, currentY + 50, { align: 'center' });

    // Título
    doc.setFontSize(16);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('EXCELÊNCIA EM VENDAS B2B ALCANÇADA!', pageWidth / 2, currentY + 65, { align: 'center' });

    // Mensagem
    doc.setFontSize(10);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFont('helvetica', 'normal');
    doc.text(
      [
        'Sua empresa atingiu o mais alto nível de maturidade em vendas B2B!',
        'Parabéns por construir uma operação de vendas de classe mundial.',
        '',
        'Continue mantendo este padrão de excelência para consolidar sua posição',
        'como líder de mercado e referência no setor.',
      ],
      pageWidth / 2,
      currentY + 80,
      { align: 'center' }
    );
  } else {
    // Recomendações normais
    recommendations.forEach((rec, index) => {
      drawShadow(doc, 20, currentY, pageWidth - 40, 42, 6);

      doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
      doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      doc.setLineWidth(1);
      doc.roundedRect(20, currentY, pageWidth - 40, 42, 6, 6, 'FD');

      // Número circular elegante
      doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      doc.circle(33, currentY + 10, 5.5, 'F');
      doc.setFontSize(10);
      doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
      doc.setFont('helvetica', 'bold');
      doc.text((index + 1).toString(), 33, currentY + 11.5, { align: 'center' });

      // Título
      doc.setFontSize(11);
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(rec.category, 45, currentY + 11);

      // Score
      doc.setFontSize(9);
      doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
      doc.setFont('helvetica', 'normal');
      doc.text(`Score: ${rec.currentScore.toFixed(1)}/5`, 45, currentY + 19);

      // Sugestão
      doc.setFontSize(8.5);
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      const suggestion = doc.splitTextToSize(rec.suggestion, pageWidth - 85);
      doc.text(suggestion, 45, currentY + 27);

      currentY += 48;
    });
  }

  // CTA Ebook - Premium
  const ebookY = currentY + 10;
  drawShadow(doc, 20, ebookY, pageWidth - 40, 55, 8);

  doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.roundedRect(20, ebookY, pageWidth - 40, 55, 8, 8, 'F');

  // Barra diagonal decorativa
  doc.setFillColor(colors.accentDark[0], colors.accentDark[1], colors.accentDark[2]);
  doc.rect(20, ebookY, 5, 55, 'F');

  doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.roundedRect(30, ebookY + 8, pageWidth - 60, 40, 5, 5, 'F');

  // Ícone (representado por símbolo)
  doc.setFontSize(16);
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.text('📖', 40, ebookY + 22);

  doc.setFontSize(11);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('BAIXE GRÁTIS: EBOOK COMPLETO', 55, ebookY + 18);

  doc.setFontSize(9);
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('5 Níveis de Maturidade em Vendas', 55, ebookY + 27);

  doc.setFontSize(8);
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('Guia completo para acelerar sua evolução comercial', 55, ebookY + 34);

  doc.setFontSize(8);
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setFont('helvetica', 'underline');
  doc.text('bit.ly/ebook-maturidade-vendas', 55, ebookY + 42);

  // === PÁGINA 4: CTA FINAL ===
  doc.addPage();

  // Background elegante com degradê
  doc.setFillColor(colors.background[0], colors.background[1], colors.background[2]);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Elemento decorativo superior
  doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setGlobalAlpha(0.1);
  doc.rect(0, 0, pageWidth, 80, 'F');
  doc.setGlobalAlpha(1);

  // Título principal
  doc.setFontSize(26);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('PRONTO PARA EVOLUIR', pageWidth / 2, 70, { align: 'center' });
  doc.text('AO PRÓXIMO NÍVEL?', pageWidth / 2, 95, { align: 'center' });

  // Card de contato premium
  drawShadow(doc, 25, 120, pageWidth - 50, 100, 10);

  doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setLineWidth(1.5);
  doc.roundedRect(25, 120, pageWidth - 50, 100, 10, 10, 'FD');

  // Barra superior
  doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.rect(25, 120, pageWidth - 50, 4, 'F');

  doc.setFontSize(14);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('A MASTERVENDAS pode ajudar sua empresa', pageWidth / 2, 145, { align: 'center' });
  doc.text('a alcançar a excelência em vendas B2B', pageWidth / 2, 158, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('Entre em contato conosco e descubra como podemos', pageWidth / 2, 177, { align: 'center' });
  doc.text('acelerar a evolução da sua área de vendas', pageWidth / 2, 188, { align: 'center' });

  // Informações de contato
  const contactY = 210;
  doc.setFontSize(10);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFont('helvetica', 'bold');

  // Email
  doc.text('E-MAIL', pageWidth / 2 - 40, contactY);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('contato@mastervendas.com.br', pageWidth / 2 - 40, contactY + 8);

  // Telefone
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text('TELEFONE', pageWidth / 2, contactY);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('(11) 99999-9999', pageWidth / 2, contactY + 8);

  // Website
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text('WEBSITE', pageWidth / 2 + 40, contactY);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('www.mastervendas.com.br', pageWidth / 2 + 40, contactY + 8);

  // Linha decorativa
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setLineWidth(1.5);
  doc.line(30, contactY - 5, pageWidth - 30, contactY - 5);

  // Footer elegante
  doc.setFontSize(9);
  doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
  doc.setFont('helvetica', 'italic');
  doc.text(
    'Este diagnóstico foi gerado especialmente para sua empresa. Utilizamos metodologia baseada em best practices de vendas B2B.',
    pageWidth / 2,
    pageHeight - 15,
    { align: 'center' }
  );

  return doc;
};
