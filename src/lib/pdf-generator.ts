import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ParsedData } from './csv-parser';

export const generatePDF = (data: ParsedData): Blob => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'letter'
  });

  const margins = { top: 15, right: 15, bottom: 15, left: 15 };
  
  const headers = [
    [
      {
        content: data.title,
        colSpan: 7,
        styles: {
          halign: 'center',
          valign: 'middle',
          fontStyle: 'bold',
          fontSize: 9.6,
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          minCellHeight: 14,
          cellPadding: { top: 1, bottom: 1, left: 2, right: 2 }
        }
      }
    ],
    [
      { content: '', styles: { minCellHeight: 8 } },
      { content: 'Last Name', styles: { minCellHeight: 8 } },
      { content: 'Name', styles: { minCellHeight: 8 } },
      { content: 'Bunk', styles: { minCellHeight: 8 } },
      { content: 'Minor 1', styles: { minCellHeight: 8 } },
      { content: 'Minor 2', styles: { minCellHeight: 8 } },
      { content: 'Minor 3', styles: { minCellHeight: 8 } }
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
      fontSize: 5.6,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.5,
      cellPadding: { top: 0.5, bottom: 0.5, left: 1.5, right: 1.5 },
      valign: 'middle',
      minCellHeight: 8,
    },
    headStyles: {
      fillColor: [211, 211, 211],
      fontStyle: 'bold',
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 85 },
      2: { cellWidth: 70 },
      3: { cellWidth: 40 },
      4: { cellWidth: 180 },
      5: { cellWidth: 180 },
      6: { cellWidth: 182 },
    }
  });

  return doc.output('blob');
};
