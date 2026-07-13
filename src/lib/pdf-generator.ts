import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ParsedData } from './csv-parser';

export const generatePDF = (data: ParsedData): Blob => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'letter'
  });

  const margins = { top: 25.2, right: 28.8, bottom: 25.2, left: 28.8 };
  
  const headers = [
    [
      {
        content: data.title,
        colSpan: 7,
        styles: {
          halign: 'center',
          valign: 'middle',
          fontStyle: 'bold',
          fontSize: 12,
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          minCellHeight: 18,
          cellPadding: { top: 1, bottom: 1, left: 2, right: 2 }
        }
      }
    ],
    [
      { content: '', styles: { minCellHeight: 11 } },
      { content: 'Last Name', styles: { minCellHeight: 11 } },
      { content: 'Name', styles: { minCellHeight: 11 } },
      { content: 'Bunk', styles: { minCellHeight: 11 } },
      { content: 'Minor 1', styles: { minCellHeight: 11 } },
      { content: 'Minor 2', styles: { minCellHeight: 11 } },
      { content: 'Minor 3', styles: { minCellHeight: 11 } }
    ]
  ] as any; // Cast as any to bypass strict type checking for jspdf-autotable head objects

  const tableData = data.rows.map((row, index) => [
    String(index + 1),
    row.LastName,
    row.Name,
    row.Bunk,
    row.Minor1,
    row.Minor2,
    row.Minor3
  ]);

  autoTable(doc, {
    startY: margins.top,
    margin: margins,
    head: headers,
    body: tableData,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.5,
      cellPadding: { top: 1, bottom: 1, left: 2, right: 2 },
      valign: 'middle',
      minCellHeight: 11,
    },
    headStyles: {
      fillColor: [211, 211, 211],
      fontStyle: 'bold',
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 80 },
      2: { cellWidth: 65 },
      3: { cellWidth: 40 },
      4: { cellWidth: 165 },
      5: { cellWidth: 165 },
      6: { cellWidth: 170 },
    }
  });

  return doc.output('blob');
};
