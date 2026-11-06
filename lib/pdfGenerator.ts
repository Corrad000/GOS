import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateClientReport = (
  azienda: any, 
  moduli: any[], 
  domandePerModulo: any[], 
  currentUser: { nome?: string; cognome?: string; email?: string } | null,
  sessionDuration: string,
  healthScore: number = 82
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  const userName = currentUser?.nome 
    ? `${currentUser.nome} ${currentUser.cognome || ''}` 
    : currentUser?.email || 'Amministratore GOS';

  const currentTimestamp = new Date().toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // --- INTESTAZIONE BRANDIZZATA (GOS) ---
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, pageWidth, 45, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('GLARING OPERATING SYSTEM', 14, 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Operational Intelligence & Corporate Strategy Report', 14, 23);

  // Info Operatore nell'Header
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generato da: ${userName} | Timestamp: ${currentTimestamp} | Sessione: ${sessionDuration}`, 14, 34);

  // --- RIFERIMENTI AZIENDA & HEALTH SCORE ---
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Report Diagnostico: ${azienda.ragione_sociale}`, 14, 56);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Settore: ${azienda.settore || 'N.D.'} | Paese: ${azienda.paese || 'Italia'}`, 14, 63);

  // Box Health Score GOS
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(pageWidth - 65, 49, 51, 24, 3, 3, 'F');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('GOS Health Score', pageWidth - 60, 56);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${healthScore} / 100`, pageWidth - 60, 66);

  // Linea divisoria
  doc.setDrawColor(203, 213, 225);
  doc.line(14, 75, pageWidth - 14, 75);

  let currentY = 82;

  // --- CONTENUTO MODULI E KEY POINT ---
  moduli.forEach((modulo, index) => {
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(79, 70, 229); // Indigo GOS
    doc.text(`${index + 1}. ${modulo.titolo}`, 14, currentY);
    currentY += 5;

    if (modulo.descrizione) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(modulo.descrizione, 14, currentY);
      currentY += 7;
    }

    const domandeDelModulo = domandePerModulo.filter(d => d.form_id === modulo.id);
    
    const tableData = domandeDelModulo.map((d, idx) => [
      `#${idx + 1}`,
      d.testo_domanda,
      d.categoria || 'Generale',
      '[ ✔ ] Analizzato'
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['N°', 'Key Point / Parametro Diagnostico', 'Area', 'Stato']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 7.5, textColor: [51, 65, 85] },
      columnStyles: { 
        0: { cellWidth: 10 }, 
        1: { cellWidth: 98 }, 
        2: { cellWidth: 35 },
        3: { cellWidth: 39 }
      },
      margin: { left: 14, right: 14 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;
  });

  // --- PIÈ DI PAGINA ---
  const pageCount = (doc as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `GOS 1.0 — Operatore: ${userName} — ${currentTimestamp} — Pagina ${i} di ${pageCount}`,
      14,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  // Download automatico del PDF brandizzato
  doc.save(`Report_GOS_${azienda.ragione_sociale.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
};
