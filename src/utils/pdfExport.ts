
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFExportOptions {
  title: string;
  content: any;
  metadata?: {
    author?: string;
    subject?: string;
    keywords?: string[];
  };
}

export const exportToPDF = async (options: PDFExportOptions): Promise<string> => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Add metadata
    if (options.metadata) {
      pdf.setProperties({
        title: options.title,
        author: options.metadata.author || 'HypoGen AI',
        subject: options.metadata.subject || 'Research Hypothesis',
        keywords: options.metadata.keywords?.join(', ') || ''
      });
    }

    // Add header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(options.title, pageWidth / 2, 20, { align: 'center' });
    
    // Add timestamp
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 30, { align: 'center' });
    
    let yPosition = 50;

    // Add hypothesis content
    if (options.content.hypothesis_text) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Hypothesis:', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const splitHypothesis = pdf.splitTextToSize(options.content.hypothesis_text, pageWidth - 40);
      pdf.text(splitHypothesis, 20, yPosition);
      yPosition += splitHypothesis.length * 5 + 10;
    }

    // Add key insights
    if (options.content.key_insights) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Key Insights:', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      options.content.key_insights.forEach((insight: string, index: number) => {
        const splitInsight = pdf.splitTextToSize(`${index + 1}. ${insight}`, pageWidth - 40);
        pdf.text(splitInsight, 20, yPosition);
        yPosition += splitInsight.length * 5 + 5;
        
        // Add new page if needed
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }
      });
      yPosition += 10;
    }

    // Add references
    if (options.content.scientific_references) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Scientific References:', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      options.content.scientific_references.forEach((ref: any, index: number) => {
        const refText = `${index + 1}. ${ref.title}`;
        const splitRef = pdf.splitTextToSize(refText, pageWidth - 40);
        pdf.text(splitRef, 20, yPosition);
        yPosition += splitRef.length * 4 + 2;
        
        if (ref.url) {
          pdf.setTextColor(0, 0, 255);
          pdf.text(ref.url, 25, yPosition);
          pdf.setTextColor(0, 0, 0);
          yPosition += 6;
        }
        
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }
      });
    }

    // Generate and return the PDF blob URL
    const pdfBlob = pdf.output('blob');
    return URL.createObjectURL(pdfBlob);
  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error('Failed to generate PDF');
  }
};

export const exportElementToPDF = async (elementId: string, filename: string): Promise<string> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const pdfBlob = pdf.output('blob');
    return URL.createObjectURL(pdfBlob);
  } catch (error) {
    console.error('Element PDF export error:', error);
    throw new Error('Failed to export element to PDF');
  }
};
