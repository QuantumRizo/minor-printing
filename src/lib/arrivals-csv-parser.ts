import Papa from 'papaparse';

export interface ArrivalRow {
  LastName: string;
  FirstName: string;
  Bunk: string;
  ArrivalTime: string;
  Immunization: string;
  Healthcare: string;
  ParentMedical: string;
}

export interface ArrivalsParsedData {
  session: number;
  rows: ArrivalRow[];
}

export const parseArrivalsCSV = (file: File, session: number): Promise<ArrivalsParsedData> => {
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

        const firstRow = data[0];
        const keys = Object.keys(firstRow);
        
        const timeCol = keys.find(k => k.includes('Trans-AssgnArrivTime'));
        const bunkCol = keys.find(k => k.toLowerCase().includes('bunk'));
        const lastNameCol = keys.find(k => k.toLowerCase().includes('last name') || k.toLowerCase().includes('lastname'));
        const firstNameCol = keys.find(k => k.toLowerCase().includes('first name') || k.toLowerCase().includes('firstname'));
        
        const immCol = keys.find(k => k.includes('Immunization Status'));
        const healthCol = keys.find(k => k.includes('HealthCareProviderOTCs Status'));
        const parentCol = keys.find(k => k.includes('ParentMedicalAuthorization Status'));

        const cleanStatus = (val: string) => {
          if (!val) return "";
          const lower = val.toLowerCase().trim();
          if (lower === 'submitted' || lower === 'completed' || lower === 'complete') {
            return "";
          }
          return val.trim();
        };

        let rows: ArrivalRow[] = data
          .filter(row => {
            return !Object.values(row).some(val => 
              String(val || "").toLowerCase().includes("alternate arrival date")
            );
          })
          .map(row => {
          return {
            LastName: lastNameCol ? String(row[lastNameCol] || "").trim() : "",
            FirstName: firstNameCol ? String(row[firstNameCol] || "").trim() : "",
            Bunk: bunkCol ? String(row[bunkCol] || "").trim() : "",
            ArrivalTime: timeCol ? String(row[timeCol] || "").trim() : "",
            Immunization: immCol ? cleanStatus(String(row[immCol])) : "",
            Healthcare: healthCol ? cleanStatus(String(row[healthCol])) : "",
            ParentMedical: parentCol ? cleanStatus(String(row[parentCol])) : ""
          };
        });

        rows.sort((a, b) => {
          if (a.LastName.toLowerCase() < b.LastName.toLowerCase()) return -1;
          if (a.LastName.toLowerCase() > b.LastName.toLowerCase()) return 1;
          if (a.FirstName.toLowerCase() < b.FirstName.toLowerCase()) return -1;
          if (a.FirstName.toLowerCase() > b.FirstName.toLowerCase()) return 1;
          return 0;
        });

        resolve({ session, rows });
      },
      error: (err) => reject(err)
    });
  });
};
