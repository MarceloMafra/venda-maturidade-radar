import jsPDF from 'jspdf';
import { MaturityLevel, MaturityCategory } from '@/data/maturityData';

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
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const margin = 20;
  let yPosition = margin;

  // Configurações de fonte
  pdf.setFont('helvetica');

  // Header com logo/título
  pdf.setFontSize(24);
  pdf.setTextColor(41, 37, 204); // Primary color
  pdf.text('Relatório de Maturidade em Vendas B2B', margin, yPosition);
  yPosition += 15;

  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Mastervendas - Diagnóstico Completo', margin, yPosition);
  yPosition += 25;

  // Score geral
  const overallScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.values(scores).length;
  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text('NÍVEL ATUAL DE MATURIDADE', margin, yPosition);
  yPosition += 10;

  pdf.setFontSize(20);
  pdf.setTextColor(41, 37, 204);
  pdf.text(`Nível ${currentLevel.id} - ${currentLevel.name}`, margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100);
  const scoreText = `Score Geral: ${overallScore.toFixed(1)}/5.0`;
  pdf.text(scoreText, margin, yPosition);
  yPosition += 20;

  // Descrição do nível
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  const splitDescription = pdf.splitTextToSize(currentLevel.description, pageWidth - 2 * margin);
  pdf.text(splitDescription, margin, yPosition);
  yPosition += splitDescription.length * 5 + 10;

  // Características principais
  pdf.setFontSize(14);
  pdf.text('CARACTERÍSTICAS PRINCIPAIS', margin, yPosition);
  yPosition += 10;

  pdf.setFontSize(11);
  currentLevel.characteristics.forEach((char) => {
    pdf.text(`• ${char}`, margin + 5, yPosition);
    yPosition += 6;
  });
  yPosition += 15;

  // Impacto na eficiência
  pdf.setFontSize(14);
  pdf.setTextColor(34, 197, 94); // Success color
  pdf.text('IMPACTO NA EFICIÊNCIA DE VENDAS', margin, yPosition);
  yPosition += 10;

  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Multiplicador de Eficiência: ${currentLevel.salesEfficiency}x`, margin, yPosition);
  yPosition += 8;
  pdf.text(`Aumento de Receita: +${currentLevel.revenueIncrease}`, margin, yPosition);
  yPosition += 15;

  const impactText = `Empresas neste nível demonstram ${currentLevel.salesEfficiency}x mais eficiência em processos de vendas e ${currentLevel.revenueIncrease} de aumento na receita comparado ao nível inicial.`;
  const splitImpactText = pdf.splitTextToSize(impactText, pageWidth - 2 * margin);
  pdf.text(splitImpactText, margin, yPosition);
  yPosition += splitImpactText.length * 5 + 20;

  // Scores por categoria
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text('ANÁLISE POR CATEGORIA', margin, yPosition);
  yPosition += 15;

  Object.entries(scores).forEach(([categoryId, score]) => {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      pdf.setFontSize(11);
      pdf.text(`${category.name}: ${score.toFixed(1)}/5.0`, margin, yPosition);
      yPosition += 6;
    }
  });
  yPosition += 15;

  // Nova página para recomendações
  if (yPosition > 200) {
    pdf.addPage();
    yPosition = margin;
  }

  // Recomendações
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text('RECOMENDAÇÕES PARA EVOLUÇÃO', margin, yPosition);
  yPosition += 15;

  recommendations.forEach((rec, index) => {
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFontSize(12);
    pdf.setTextColor(41, 37, 204);
    pdf.text(`${index + 1}. ${rec.category}`, margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Score atual: ${rec.currentScore.toFixed(1)}/5`, margin + 5, yPosition);
    yPosition += 8;

    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    const splitSuggestion = pdf.splitTextToSize(rec.suggestion, pageWidth - 2 * margin - 5);
    pdf.text(splitSuggestion, margin + 5, yPosition);
    yPosition += splitSuggestion.length * 5 + 10;
  });

  // Call to action
  if (yPosition > 220) {
    pdf.addPage();
    yPosition = margin;
  }

  yPosition += 20;
  pdf.setFontSize(16);
  pdf.setTextColor(41, 37, 204);
  pdf.text('PRÓXIMOS PASSOS', margin, yPosition);
  yPosition += 15;

  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  const ctaText = 'A Mastervendas pode ajudar sua empresa a alcançar o próximo nível de maturidade em vendas B2B. Entre em contato conosco para uma consultoria personalizada e desenvolva estratégias eficazes para aumentar suas vendas e receita.';
  const splitCtaText = pdf.splitTextToSize(ctaText, pageWidth - 2 * margin);
  pdf.text(splitCtaText, margin, yPosition);
  yPosition += splitCtaText.length * 5 + 15;

  pdf.setFontSize(14);
  pdf.setTextColor(41, 37, 204);
  pdf.text('Contato: contato@mastervendas.com', margin, yPosition);

  // Footer
  const pageCount = pdf.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Mastervendas - Relatório de Maturidade em Vendas B2B - Página ${i} de ${pageCount}`, margin, pdf.internal.pageSize.height - 10);
  }

  return pdf;
};