import { useState, useCallback } from 'react';
import { UploadCloud, Printer, FileText, CheckCircle, Download, Loader2, LayoutDashboard, Menu, X } from 'lucide-react';
import { parseCSV, type ParsedData } from './lib/csv-parser';
import { generatePDF } from './lib/pdf-generator';
import { parseVisitingCSV, type VisitingParsedData } from './lib/visiting-csv-parser';
import { generateVisitingPDF } from './lib/visiting-pdf-generator';
import { parseArrivalsCSV, type ArrivalsParsedData } from './lib/arrivals-csv-parser';
import { generateLuggagePDF, generateFormsPDF } from './lib/arrivals-pdf-generator';

type ModuleType = 'home' | 'minor-printing' | 'six-minors-printing' | 'forms-luggage-printing';

function App() {
  const [currentModule, setCurrentModule] = useState<ModuleType>('home');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [formsPdfUrl, setFormsPdfUrl] = useState<string | null>(null);
  const [sessionNumber, setSessionNumber] = useState<number>(4);
  const [isDragging, setIsDragging] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "text/csv" || droppedFile.name.endsWith(".csv")) {
        setFile(droppedFile);
        resetState();
      } else {
        setError("Please upload a valid CSV file.");
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      resetState();
    }
  };

  const resetState = () => {
    setIsSuccess(false);
    setError(null);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    if (formsPdfUrl) {
      URL.revokeObjectURL(formsPdfUrl);
      setFormsPdfUrl(null);
    }
  };

  const handleGenerate = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      if (currentModule === 'six-minors-printing') {
        const parsedData: VisitingParsedData = await parseVisitingCSV(file);
        const pdfBlob = generateVisitingPDF(parsedData);
        
        const url = URL.createObjectURL(pdfBlob);
        setPdfUrl(url);
      } else if (currentModule === 'forms-luggage-printing') {
        const parsedData: ArrivalsParsedData = await parseArrivalsCSV(file, sessionNumber);
        const luggageBlob = generateLuggagePDF(parsedData);
        const formsBlob = generateFormsPDF(parsedData);
        
        setPdfUrl(URL.createObjectURL(luggageBlob));
        setFormsPdfUrl(URL.createObjectURL(formsBlob));
      } else {
        const parsedData: ParsedData = await parseCSV(file);
        const pdfBlob = generatePDF(parsedData);
        
        const url = URL.createObjectURL(pdfBlob);
        setPdfUrl(url);
      }
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during processing.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleModuleChange = (module: ModuleType) => {
    setCurrentModule(module);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc]">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 z-30">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <Printer size={20} />
          </div>
          <span className="font-extrabold text-slate-800 tracking-tight">Program Office Daily</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-600 hover:text-slate-800 transition-colors"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Overlay for Mobile */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-slate-900 text-slate-300 border-r border-slate-800 z-50 transform transition-transform duration-300 md:translate-x-0 md:static md:h-screen flex flex-col
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header (desktop only) */}
        <div className="hidden md:flex items-center gap-2 p-6 border-b border-slate-800">
          <div className="p-2 bg-blue-950 text-blue-400 rounded-xl">
            <Printer size={24} />
          </div>
          <span className="font-extrabold text-white text-lg tracking-tight">Program Office Daily</span>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => handleModuleChange('home')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 cursor-pointer ${
              currentModule === 'home' 
                ? 'bg-blue-900/45 text-blue-300 font-semibold' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
            }`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          
          <button
            onClick={() => handleModuleChange('minor-printing')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 cursor-pointer ${
              currentModule === 'minor-printing' 
                ? 'bg-blue-900/45 text-blue-300 font-semibold' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
            }`}
          >
            <Printer size={20} />
            Daily Minor Printing
          </button>
          
          <button
            onClick={() => handleModuleChange('six-minors-printing')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 cursor-pointer ${
              currentModule === 'six-minors-printing' 
                ? 'bg-blue-900/45 text-blue-300 font-semibold' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
            }`}
          >
            <Printer size={20} />
            Visiting Day Minor Printing
          </button>
          
          <button
            onClick={() => handleModuleChange('forms-luggage-printing')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 cursor-pointer ${
              currentModule === 'forms-luggage-printing' 
                ? 'bg-blue-900/45 text-blue-300 font-semibold' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
            }`}
          >
            <FileText size={20} />
            Arrivals & Forms
          </button>

          {/* Placeholders Section */}
          <div className="pt-4 mt-4 border-t border-slate-800">
            <span className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Next Operations
            </span>
            <div className="px-4 py-2.5 rounded-xl text-slate-500 text-sm font-medium bg-slate-800/30 border border-dashed border-slate-800">
              Feature coming soon...
            </div>
          </div>
        </nav>
        
        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 text-center text-xs text-slate-500 font-medium">
          Daily Ops v1.1.0
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full relative">
          
          {currentModule === 'home' ? (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Program Office Daily</h1>
                <p className="text-slate-500 mt-1">Select a module to handle today's tasks.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Active Tool */}
                <button
                  onClick={() => setCurrentModule('minor-printing')}
                  className="glass-panel text-left p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-blue-300 hover:bg-blue-50/50 group border border-slate-100 cursor-pointer"
                >
                  <div>
                    <div className="inline-flex items-center justify-center p-4 bg-blue-100 text-blue-600 rounded-2xl mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                      <Printer size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Daily Minor Printing (3)</h2>
                    <p className="text-slate-500 mb-6">Format and generate 3-minor schedules to pin outside daily.</p>
                  </div>
                  <span className="text-blue-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Open Module &rarr;
                  </span>
                </button>

                {/* 6 Minors Printing Tool */}
                <button
                  onClick={() => setCurrentModule('six-minors-printing')}
                  className="glass-panel text-left p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-blue-300 hover:bg-blue-50/50 group border border-slate-100 cursor-pointer"
                >
                  <div>
                    <div className="inline-flex items-center justify-center p-4 bg-blue-100 text-blue-600 rounded-2xl mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                      <Printer size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Visiting Day Minor Printing</h2>
                    <p className="text-slate-500 mb-6">Format and generate 6-minor schedules (legal size).</p>
                  </div>
                  <span className="text-blue-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Open Module &rarr;
                  </span>
                </button>

                {/* Forms & Luggage Printing Tool */}
                <button
                  onClick={() => setCurrentModule('forms-luggage-printing')}
                  className="glass-panel text-left p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-blue-300 hover:bg-blue-50/50 group border border-slate-100 cursor-pointer"
                >
                  <div>
                    <div className="inline-flex items-center justify-center p-4 bg-blue-100 text-blue-600 rounded-2xl mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                      <FileText size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Arrivals & Forms</h2>
                    <p className="text-slate-500 mb-6">Format and generate luggage and forms PDFs for sessions.</p>
                  </div>
                  <span className="text-blue-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Open Module &rarr;
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                <span className="hover:text-slate-800 cursor-pointer" onClick={() => setCurrentModule('home')}>Dashboard</span>
                <span>/</span>
                <span className="text-slate-800 font-medium">
                  {currentModule === 'minor-printing' ? 'Daily Minor Printing' : currentModule === 'six-minors-printing' ? 'Visiting Day Minor Printing' : 'Arrivals & Forms'}
                </span>
              </div>

              <div className="glass-panel w-full max-w-2xl p-8 mx-auto border border-slate-100 bg-white">
                <header className="text-center mb-10">
                  <div className="inline-flex items-center justify-center p-3 bg-blue-100 text-blue-600 rounded-2xl mb-4 shadow-sm">
                    {currentModule === 'forms-luggage-printing' ? <FileText size={32} /> : <Printer size={32} />}
                  </div>
                  <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                    {currentModule === 'minor-printing' ? 'Daily Minor Printing (3)' : currentModule === 'six-minors-printing' ? 'Visiting Day Minor Printing' : 'Arrivals & Forms'}
                  </h1>
                  <p className="text-slate-500 mt-2 text-lg">
                    {currentModule === 'minor-printing' ? 'Format daily schedules to pin outside (Letter)' : currentModule === 'six-minors-printing' ? 'Format daily schedules to pin outside (Legal)' : 'Generate Luggage and Forms PDF from arrival times CSV'}
                  </p>
                </header>

                <section className="space-y-6">
                  {currentModule === 'forms-luggage-printing' && (
                    <div className="flex flex-col gap-2 mb-6 w-full max-w-xs mx-auto">
                      <label className="text-sm font-semibold text-slate-700 text-center">Select Session</label>
                      <select 
                        value={sessionNumber}
                        onChange={(e) => setSessionNumber(Number(e.target.value))}
                        className="p-3 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value={1}>Session 1</option>
                        <option value={2}>Session 2</option>
                        <option value={3}>Session 3</option>
                        <option value={4}>Session 4</option>
                      </select>
                    </div>
                  )}

                  {/* CSV Drag and Drop */}
                  <div 
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                      isDragging ? 'border-blue-500 bg-blue-50/50 scale-[1.02]' : 
                      file ? 'border-green-300 bg-green-50/30' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <input 
                      id="file-upload" 
                      type="file" 
                      accept=".csv" 
                      className="hidden" 
                      onChange={handleFileChange} 
                    />
                    
                    {file ? (
                      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                        <FileText size={48} className="text-green-500 mb-3" />
                        <span className="font-semibold text-slate-700">{file.name}</span>
                        <span className="text-sm text-slate-500 mt-1">{(file.size / 1024).toFixed(1)} KB</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <UploadCloud size={48} className="text-slate-400 mb-3" />
                        <span className="font-medium text-slate-600">Click to upload or drag & drop</span>
                        <span className="text-sm text-slate-400 mt-1">CSV files only</span>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium border border-red-100 flex items-center animate-in slide-in-from-top-2">
                      <span className="mr-2">⚠️</span> {error}
                    </div>
                  )}

                  <div className="flex justify-center mt-8">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerate();
                      }}
                      disabled={!file || isProcessing}
                      className={`
                        group flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold text-white text-lg
                        transition-all duration-300 shadow-lg shadow-blue-200 w-full sm:w-auto min-w-[200px]
                        ${!file ? 'bg-slate-300 cursor-not-allowed shadow-none' : 
                          isProcessing ? 'bg-blue-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-300 hover:-translate-y-0.5 active:translate-y-0'}
                      `}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="animate-spin" size={22} />
                          Processing...
                        </>
                      ) : (
                        <>
                          Generate PDF
                        </>
                      )}
                    </button>
                  </div>

                  {isSuccess && pdfUrl && (
                    <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center text-green-600 font-semibold mb-6 bg-green-50 px-4 py-2 rounded-full">
                        <CheckCircle size={20} className="mr-2" />
                        PDF generated successfully!
                      </div>
                      
                      <a
                        href={pdfUrl}
                        download={currentModule === 'six-minors-printing' ? "Visiting_Day_Minors.pdf" : currentModule === 'forms-luggage-printing' ? `Luggage_Session_${sessionNumber}.pdf` : "Master_Minors_Printed_Version.pdf"}
                        className="flex items-center gap-6 pr-10 pl-6 py-5 bg-white border-2 border-slate-200 text-slate-700 rounded-full font-bold hover:border-blue-300 hover:bg-blue-50 transition-all shadow-sm hover:shadow-md hover:scale-105"
                      >
                        <img 
                          src="/ron.png" 
                          alt="Success mascot" 
                          className="w-24 h-24 object-cover rounded-full shadow-sm border border-slate-100"
                        />
                        <span className="flex items-center gap-3 text-2xl">
                          <Download size={28} />
                          {currentModule === 'forms-luggage-printing' ? 'Download Luggage PDF' : 'Download PDF'}
                        </span>
                      </a>

                      {currentModule === 'forms-luggage-printing' && formsPdfUrl && (
                        <a
                          href={formsPdfUrl}
                          download={`Forms_Session_${sessionNumber}.pdf`}
                          className="mt-4 flex items-center gap-6 pr-10 pl-6 py-5 bg-white border-2 border-slate-200 text-slate-700 rounded-full font-bold hover:border-blue-300 hover:bg-blue-50 transition-all shadow-sm hover:shadow-md hover:scale-105"
                        >
                          <img 
                            src="/ron.png" 
                            alt="Success mascot" 
                            className="w-24 h-24 object-cover rounded-full shadow-sm border border-slate-100"
                          />
                          <span className="flex items-center gap-3 text-2xl">
                            <Download size={28} />
                            Download Forms PDF
                          </span>
                        </a>
                      )}
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
