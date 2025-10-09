import jsPDF from 'jspdf';

interface InsightCard {
  title: string;
  content: string;
  icon: string;
  subItems?: Array<{ label: string; value: string }>;
}

interface MediaPlanWeek {
  week: number;
  channels: Array<{
    name: string;
    budget: string;
    campaignType: string;
    allocation: string;
    color: string;
  }>;
  reasoning: string;
}

interface AnalysisData {
  customerInsight: {
    sections: InsightCard[];
  };
  campaignTargeting: {
    sections: InsightCard[];
  };
  mediaPlan: {
    weeks: MediaPlanWeek[];
  };
}

const channelColors: Record<string, string> = {
  google: '#4285F4',
  meta: '#0084FF',
  facebook: '#0084FF',
  instagram: '#E4405F',
  tiktok: '#000000',
  linkedin: '#0A66C2',
  twitter: '#1DA1F2',
  youtube: '#FF0000',
  pinterest: '#E60023',
  snapchat: '#FFFC00',
};

export const generatePDF = async (data: AnalysisData, url: string): Promise<void> => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPosition = margin;

  // Helper function to add new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Helper to add page numbers
  const addPageNumber = () => {
    const pageCount = (pdf as any).internal.pages.length - 1;
    pdf.setFontSize(9);
    pdf.setTextColor(150);
    pdf.text(
      `Page ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  };

  // Cover Page
  pdf.setFillColor(59, 130, 246); // Primary blue
  pdf.rect(0, 0, pageWidth, 80, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(32);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Landing Page Analysis', pageWidth / 2, 40, { align: 'center' });
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Marketing Campaign Intelligence Report', pageWidth / 2, 55, { align: 'center' });

  yPosition = 100;
  pdf.setTextColor(0);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Analyzed URL:', margin, yPosition);
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  const urlLines = pdf.splitTextToSize(url, contentWidth - 30);
  pdf.text(urlLines, margin, yPosition + 7);
  
  yPosition += 20 + (urlLines.length * 5);
  
  pdf.setFontSize(10);
  pdf.setTextColor(100);
  pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, margin, yPosition);

  // Table of Contents
  yPosition += 20;
  checkPageBreak(40);
  
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0);
  pdf.text('Table of Contents', margin, yPosition);
  
  yPosition += 12;
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text('1. Customer Insight', margin + 5, yPosition);
  yPosition += 7;
  pdf.text('2. Campaign Targeting', margin + 5, yPosition);
  yPosition += 7;
  pdf.text('3. Media Plan', margin + 5, yPosition);

  addPageNumber();

  // Section 1: Customer Insight
  pdf.addPage();
  yPosition = margin;
  
  pdf.setFillColor(59, 130, 246);
  pdf.rect(0, yPosition - 5, pageWidth, 15, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('1. Customer Insight', margin, yPosition + 5);
  
  yPosition += 20;
  pdf.setTextColor(0);

  data.customerInsight.sections.forEach((section, index) => {
    checkPageBreak(50);
    
    // Section header with icon
    pdf.setFillColor(240, 240, 250);
    pdf.roundedRect(margin, yPosition, contentWidth, 12, 2, 2, 'F');
    
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(59, 130, 246);
    pdf.text(section.title, margin + 5, yPosition + 8);
    
    yPosition += 17;
    
    // Content
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(50);
    const contentLines = pdf.splitTextToSize(section.content, contentWidth - 10);
    pdf.text(contentLines, margin + 5, yPosition);
    yPosition += contentLines.length * 5 + 5;
    
    // Sub-items
    if (section.subItems && section.subItems.length > 0) {
      section.subItems.forEach(item => {
        checkPageBreak(15);
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(100);
        pdf.text(`• ${item.label}:`, margin + 8, yPosition);
        
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(50);
        const valueLines = pdf.splitTextToSize(item.value, contentWidth - 25);
        pdf.text(valueLines, margin + 15, yPosition + 4);
        yPosition += Math.max(7, valueLines.length * 4.5);
      });
    }
    
    yPosition += 8;
  });

  addPageNumber();

  // Section 2: Campaign Targeting
  pdf.addPage();
  yPosition = margin;
  
  pdf.setFillColor(139, 92, 246);
  pdf.rect(0, yPosition - 5, pageWidth, 15, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('2. Campaign Targeting', margin, yPosition + 5);
  
  yPosition += 20;
  pdf.setTextColor(0);

  data.campaignTargeting.sections.forEach((section) => {
    checkPageBreak(50);
    
    // Section header
    pdf.setFillColor(245, 243, 255);
    pdf.roundedRect(margin, yPosition, contentWidth, 12, 2, 2, 'F');
    
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(139, 92, 246);
    pdf.text(section.title, margin + 5, yPosition + 8);
    
    yPosition += 17;
    
    // Content
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(50);
    const contentLines = pdf.splitTextToSize(section.content, contentWidth - 10);
    pdf.text(contentLines, margin + 5, yPosition);
    yPosition += contentLines.length * 5 + 5;
    
    // Sub-items
    if (section.subItems && section.subItems.length > 0) {
      section.subItems.forEach(item => {
        checkPageBreak(15);
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(100);
        pdf.text(`• ${item.label}:`, margin + 8, yPosition);
        
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(50);
        const valueLines = pdf.splitTextToSize(item.value, contentWidth - 25);
        pdf.text(valueLines, margin + 15, yPosition + 4);
        yPosition += Math.max(7, valueLines.length * 4.5);
      });
    }
    
    yPosition += 8;
  });

  addPageNumber();

  // Section 3: Media Plan
  pdf.addPage();
  yPosition = margin;
  
  pdf.setFillColor(16, 185, 129);
  pdf.rect(0, yPosition - 5, pageWidth, 15, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('3. Media Plan', margin, yPosition + 5);
  
  yPosition += 20;
  pdf.setTextColor(0);

  data.mediaPlan.weeks.forEach((week, weekIndex) => {
    checkPageBreak(70);
    
    // Week header
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(16, 185, 129);
    pdf.text(`Week ${week.week}`, margin, yPosition);
    
    yPosition += 10;
    
    // Table header
    const colWidths = [50, 30, 40, 30];
    const tableStartX = margin;
    
    pdf.setFillColor(240, 253, 244);
    pdf.rect(tableStartX, yPosition - 5, contentWidth, 8, 'F');
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0);
    pdf.text('Channel', tableStartX + 2, yPosition);
    pdf.text('Budget', tableStartX + colWidths[0] + 2, yPosition);
    pdf.text('Campaign Type', tableStartX + colWidths[0] + colWidths[1] + 2, yPosition);
    pdf.text('Allocation', tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + 2, yPosition);
    
    yPosition += 8;
    
    // Table rows
    week.channels.forEach((channel, idx) => {
      checkPageBreak(15);
      
      if (idx % 2 === 0) {
        pdf.setFillColor(250, 250, 250);
        pdf.rect(tableStartX, yPosition - 5, contentWidth, 10, 'F');
      }
      
      // Get channel color
      const channelKey = channel.name.toLowerCase().split(' ')[0];
      const color = channelColors[channelKey] || '#000000';
      const rgb = hexToRgb(color);
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(rgb.r, rgb.g, rgb.b);
      pdf.text(channel.name, tableStartX + 2, yPosition);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(50);
      pdf.text(channel.budget, tableStartX + colWidths[0] + 2, yPosition);
      
      const campaignLines = pdf.splitTextToSize(channel.campaignType, colWidths[2] - 4);
      pdf.text(campaignLines[0], tableStartX + colWidths[0] + colWidths[1] + 2, yPosition);
      
      pdf.text(channel.allocation, tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + 2, yPosition);
      
      yPosition += 10;
    });
    
    yPosition += 5;
    
    // Reasoning
    if (week.reasoning) {
      checkPageBreak(20);
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(100);
      pdf.text('Strategy:', margin, yPosition);
      
      yPosition += 5;
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(70);
      const reasoningLines = pdf.splitTextToSize(week.reasoning, contentWidth - 5);
      pdf.text(reasoningLines, margin + 2, yPosition);
      yPosition += reasoningLines.length * 4.5;
    }
    
    yPosition += 10;
  });

  addPageNumber();

  // Footer page
  pdf.addPage();
  yPosition = pageHeight / 2 - 20;
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100);
  pdf.text('This report was generated automatically using AI analysis.', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  pdf.setFontSize(10);
  pdf.text('For best results, verify recommendations with your marketing team.', pageWidth / 2, yPosition, { align: 'center' });

  addPageNumber();

  // Save PDF
  const filename = `landing-page-analysis-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
};

// Helper function to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}
