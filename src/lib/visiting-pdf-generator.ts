import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { VisitingParsedData } from './visiting-csv-parser';

export const generateVisitingPDF = (data: VisitingParsedData): Blob => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'legal'
  });

  const margins = { top: 25.2, right: 28.8, bottom: 25.2, left: 28.8 };
  
  const headers = [
    [
      {
        content: data.title,
        colSpan: 10,
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
      { content: '', styles: { minCellHeight: 20 } },
      { content: 'Bunk', styles: { minCellHeight: 20 } },
      { content: 'Last Name', styles: { minCellHeight: 20 } },
      { content: 'Name', styles: { minCellHeight: 20 } },
      { content: 'Minor 1\n9:30 - 10:30', styles: { minCellHeight: 20, halign: 'center' } },
      { content: 'Minor 2\n10:45 - 11:45', styles: { minCellHeight: 20, halign: 'center' } },
      { content: 'Minor 3\n12:00 - 1:00', styles: { minCellHeight: 20, halign: 'center' } },
      { content: 'Minor 4\n2:15 - 3:15', styles: { minCellHeight: 20, halign: 'center' } },
      { content: 'Minor 5\n3:30 - 4:30', styles: { minCellHeight: 20, halign: 'center' } },
      { content: 'Minor 6\n4:45 - 5:45', styles: { minCellHeight: 20, halign: 'center' } }
    ]
  ] as any; // Cast as any to bypass strict type checking for jspdf-autotable head objects

  const tableData = data.rows.map((row, index) => [
    String(index + 1),
    row.Bunk,
    row.LastName,
    row.Name,
    row.Minor1,
    row.Minor2,
    row.Minor3,
    row.Minor4,
    row.Minor5,
    row.Minor6
  ]);

  autoTable(doc, {
    startY: margins.top,
    margin: margins,
    head: headers,
    body: tableData,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 6.5,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.5,
      cellPadding: { top: 1, bottom: 1, left: 1.5, right: 1.5 },
      valign: 'middle',
      minCellHeight: 10,
    },
    headStyles: {
      fillColor: [211, 211, 211],
      fontStyle: 'bold',
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 35 },
      2: { cellWidth: 70 },
      3: { cellWidth: 60 },
      4: { cellWidth: 125 },
      5: { cellWidth: 125 },
      6: { cellWidth: 125 },
      7: { cellWidth: 125 },
      8: { cellWidth: 125 },
      9: { cellWidth: 125 },
    },
    didDrawPage: function () {
      doc.setFontSize(8);
      const pageSize = doc.internal.pageSize;
      const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();
      const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
      const pages = typeof doc.getNumberOfPages === 'function' ? doc.getNumberOfPages() : (doc.internal as any).getNumberOfPages();
      const str = `Page ${pages} of {totalPages}`;
      doc.text(str, pageWidth - margins.right, pageHeight - 10, { align: 'right' });
    }
  });

  if (typeof doc.putTotalPages === 'function') {
    doc.putTotalPages('{totalPages}');
  }

  return doc.output('blob');
};
