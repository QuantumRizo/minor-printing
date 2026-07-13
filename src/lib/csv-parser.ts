import Papa from 'papaparse';

export interface MinorScheduleRow {
  LastName: string;
  Name: string;
  Bunk: string;
  Minor1: string;
  Minor2: string;
  Minor3: string;
}

export interface ParsedData {
  title: string;
  rows: MinorScheduleRow[];
}

export const parseCSV = (file: File): Promise<ParsedData> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];
        if (data.length === 0) {
          reject(new Error("CSV is empty."));
          return;
        }

        // Determine title
        let dateVal = "";
        const firstRow = data[0];
        if (firstRow['Date']) {
          dateVal = String(firstRow['Date']);
        } else if (firstRow['Day']) {
          dateVal = String(firstRow['Day']);
        }
        
        let reportTitle = "Minors Schedule";
        if (dateVal) {
          reportTitle = `Minors ${dateVal} A - Z`;
        }

        // Data transformation
        data.sort((a, b) => {
          const lastNameA = String(a['Last Name'] || "").trim().toLowerCase();
          const lastNameB = String(b['Last Name'] || "").trim().toLowerCase();
          if (lastNameA < lastNameB) return -1;
          if (lastNameA > lastNameB) return 1;
          
          const firstNameA = String(a['First Name'] || "").trim().toLowerCase();
          const firstNameB = String(b['First Name'] || "").trim().toLowerCase();
          if (firstNameA < firstNameB) return -1;
          if (firstNameA > firstNameB) return 1;
          
          return 0;
        });

        const rows: MinorScheduleRow[] = data.map((row) => {
          const preferredName = row['Preferred Name'] ? String(row['Preferred Name']).trim() : "";
          const firstName = row['First Name'] ? String(row['First Name']).trim() : "";
          const name = preferredName || firstName;

          const truncate = (val: any) => {
            let str = String(val || "").trim();
            // Handle float values like 1.0 -> 1
            if (!isNaN(Number(str)) && Number.isInteger(Number(str))) {
              str = String(parseInt(str, 10));
            }
            if (str.length > 42) {
              return str.substring(0, 39) + '...';
            }
            return str;
          };

          return {
            LastName: String(row['Last Name'] || "").trim(),
            Name: name,
            Bunk: String(row['Bunk'] || "").trim(),
            Minor1: truncate(row['Period 1']),
            Minor2: truncate(row['Period 2']),
            Minor3: truncate(row['Period 3']),
          };
        });

        resolve({ title: reportTitle, rows });
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};
