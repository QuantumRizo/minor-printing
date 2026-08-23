import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ArrivalsParsedData } from './arrivals-csv-parser';

export const generateLuggagePDF = (data: ArrivalsParsedData): Blob => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter'
  });

  const margins = { top: 36, right: 36, bottom: 36, left: 36 };
  const title = `LUGGAGE SESSION ${data.session}`;
  const hasTime = data.hasArrivalTime;

  const headers = [
    [
      {
        content: title,
        colSpan: hasTime ? 6 : 5,
        styles: {
          halign: 'center',
          valign: 'middle',
          fontStyle: 'bold',
          fontSize: 14,
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          minCellHeight: 24,
          cellPadding: 4
        }
      }
    ],
    hasTime
      ? [
          { content: 'Checkbox', styles: { minCellHeight: 14 } },
          { content: '', styles: { minCellHeight: 14 } },
          { content: 'Last Name', styles: { minCellHeight: 14 } },
          { content: 'Name', styles: { minCellHeight: 14 } },
          { content: 'Bunk', styles: { minCellHeight: 14 } },
          { content: 'Arrival Time', styles: { minCellHeight: 14 } }
        ]
      : [
          { content: 'Checkbox', styles: { minCellHeight: 14 } },
          { content: '', styles: { minCellHeight: 14 } },
          { content: 'Last Name', styles: { minCellHeight: 14 } },
          { content: 'Name', styles: { minCellHeight: 14 } },
          { content: 'Bunk', styles: { minCellHeight: 14 } }
        ]
  ] as any;

  const tableData = data.rows.map((row, index) => {
    if (hasTime) {
      return [
        '', // Checkbox empty
        String(index + 1),
        row.LastName,
        row.FirstName,
        row.Bunk,
        row.ArrivalTime || ''
      ];
    } else {
      return [
        '', // Checkbox empty
        String(index + 1),
        row.LastName,
        row.FirstName,
        row.Bunk
      ];
    }
  });

  const columnStyles: Record<number, any> = hasTime
    ? {
        0: { cellWidth: 50 },
        1: { cellWidth: 30, halign: 'right' },
        2: { cellWidth: 120 },
        3: { cellWidth: 120 },
        4: { cellWidth: 80 },
        5: { cellWidth: 140 },
      }
    : {
        0: { cellWidth: 50 },
        1: { cellWidth: 35, halign: 'right' },
        2: { cellWidth: 180 },
        3: { cellWidth: 180 },
        4: { cellWidth: 95 },
      };

  autoTable(doc, {
    startY: margins.top,
    margin: margins,
    head: headers,
    body: tableData,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.5,
      cellPadding: { top: 2, bottom: 2, left: 3, right: 3 },
      valign: 'middle',
      minCellHeight: 14,
    },
    headStyles: {
      fillColor: [211, 211, 211],
      fontStyle: 'bold',
      halign: 'left',
    },
    columnStyles,
    didDrawPage: function () {
      doc.setFontSize(9);
      const pageSize = doc.internal.pageSize;
      const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();
      const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
      const pages = typeof doc.getNumberOfPages === 'function' ? doc.getNumberOfPages() : (doc.internal as any).getNumberOfPages();
      const str = `Page ${pages} of {totalPages}`;
      doc.text(str, pageWidth - margins.right, pageHeight - 15, { align: 'right' });
    }
  });

  if (typeof doc.putTotalPages === 'function') {
    doc.putTotalPages('{totalPages}');
  }

  return doc.output('blob');
};

export const generateFormsPDF = (data: ArrivalsParsedData): Blob => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'letter'
  });

  const margins = { top: 36, right: 36, bottom: 36, left: 36 };
  const title = `FORMS SESSION ${data.session}`;
  const hasTime = data.hasArrivalTime;

  const headers = [
    [
      {
        content: title,
        colSpan: hasTime ? 8 : 7,
        styles: {
          halign: 'center',
          valign: 'middle',
          fontStyle: 'bold',
          fontSize: 14,
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          minCellHeight: 24,
          cellPadding: 4
        }
      }
    ],
    hasTime
      ? [
          { content: '', styles: { minCellHeight: 14 } },
          { content: 'Last Name', styles: { minCellHeight: 14 } },
          { content: 'First Name', styles: { minCellHeight: 14 } },
          { content: 'Bunk', styles: { minCellHeight: 14 } },
          { content: 'Arrival Time', styles: { minCellHeight: 14 } },
          { content: 'ParentMedicalAuthorization Status', styles: { minCellHeight: 14 } },
          { content: 'HealthCareProviderOTCs Status', styles: { minCellHeight: 14 } },
          { content: 'Immunization Status', styles: { minCellHeight: 14 } }
        ]
      : [
          { content: '', styles: { minCellHeight: 14 } },
          { content: 'Last Name', styles: { minCellHeight: 14 } },
          { content: 'First Name', styles: { minCellHeight: 14 } },
          { content: 'Bunk', styles: { minCellHeight: 14 } },
          { content: 'ParentMedicalAuthorization Status', styles: { minCellHeight: 14 } },
          { content: 'HealthCareProviderOTCs Status', styles: { minCellHeight: 14 } },
          { content: 'Immunization Status', styles: { minCellHeight: 14 } }
        ]
  ] as any;

  const tableData = data.rows.map((row, index) => {
    if (hasTime) {
      return [
        String(index + 1),
        row.LastName,
        row.FirstName,
        row.Bunk,
        row.ArrivalTime || '',
        row.ParentMedical,
        row.Healthcare,
        row.Immunization
      ];
    } else {
      return [
        String(index + 1),
        row.LastName,
        row.FirstName,
        row.Bunk,
        row.ParentMedical,
        row.Healthcare,
        row.Immunization
      ];
    }
  });

  const columnStyles: Record<number, any> = hasTime
    ? {
        0: { cellWidth: 30, halign: 'right' },
        1: { cellWidth: 80 },
        2: { cellWidth: 80 },
        3: { cellWidth: 50 },
        4: { cellWidth: 100 },
        5: { cellWidth: 135 },
        6: { cellWidth: 120 },
        7: { cellWidth: 120 },
      }
    : {
        0: { cellWidth: 30, halign: 'right' },
        1: { cellWidth: 105 },
        2: { cellWidth: 105 },
        3: { cellWidth: 60 },
        4: { cellWidth: 145 },
        5: { cellWidth: 135 },
        6: { cellWidth: 140 },
      };

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
      cellPadding: { top: 2, bottom: 2, left: 3, right: 3 },
      valign: 'middle',
      minCellHeight: 12,
    },
    headStyles: {
      fillColor: [211, 211, 211],
      fontStyle: 'bold',
      halign: 'left',
    },
    columnStyles,
    didDrawPage: function () {
      doc.setFontSize(9);
      const pageSize = doc.internal.pageSize;
      const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();
      const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
      const pages = typeof doc.getNumberOfPages === 'function' ? doc.getNumberOfPages() : (doc.internal as any).getNumberOfPages();
      const str = `Page ${pages} of {totalPages}`;
      doc.text(str, pageWidth - margins.right, pageHeight - 15, { align: 'right' });
    }
  });

  if (typeof doc.putTotalPages === 'function') {
    doc.putTotalPages('{totalPages}');
  }

  return doc.output('blob');
};
