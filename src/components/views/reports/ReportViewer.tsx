import React from 'react';
import { IReportData, IReportSection } from '@/domain/reporting/interfaces/IReport';
import { Button } from '@/components/ui/button';
import { Printer, Download, FileText } from 'lucide-react';

interface ReportViewerProps {
  data: IReportData;
  onPrint: () => void;
  onExport: () => void;
}

/**
 * Компонент для отображения сформированного отчета
 */
export const ReportViewer: React.FC<ReportViewerProps> = ({ data, onPrint, onExport }) => {
  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg border overflow-hidden soft-border">
      {/* Панель инструментов отчета */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/20 soft-border">
        <div className="flex items-center gap-2 text-slate-700">
          <FileText className="h-5 w-5" />
          <span className="font-semibold">Предварительный просмотр</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onPrint}>
            <Printer className="h-4 w-4 mr-2" /> Печать
          </Button>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" /> PDF
          </Button>
        </div>
      </div>

      {/* Содержимое отчета (стилизовано под бумажный лист) */}
      <div className="flex-1 overflow-auto p-8 bg-slate-200 flex justify-center">
        <div className="w-[210mm] min-h-[297mm] bg-white shadow-xl p-[20mm] text-slate-900 report-paper border soft-border">
          <header className="border-b pb-4 mb-8 flex justify-between items-start soft-border">
            <div>
              <h1 className="text-3xl font-bold uppercase tracking-tighter mb-1">ПланПро</h1>
              <p className="text-sm text-slate-500 italic">Professional Project Management</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-bold">{data.reportTitle}</p>
              <p>{data.generatedAt.toLocaleDateString()} {data.generatedAt.toLocaleTimeString()}</p>
            </div>
          </header>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-bold border-b mb-4">Информация о проекте</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <p><span className="font-semibold">Проект:</span> {data.projectName}</p>
                <p><span className="font-semibold">Менеджер:</span> {data.projectManager}</p>
              </div>
            </section>

            {data.sections.map((section, idx) => (
              <ReportSection key={idx} section={section} />
            ))}
          </div>

          <footer className="mt-12 pt-4 border-t text-[10px] text-slate-400 text-center soft-border">
            Этот отчет был сгенерирован автоматически системой ПланПро Electron.
          </footer>
        </div>
      </div>
    </div>
  );
};

const ReportSection: React.FC<{ section: IReportSection }> = ({ section }) => {
  return (
    <section>
      <h3 className="text-lg font-bold text-slate-800 mb-3 uppercase tracking-wide">{section.title}</h3>
      
      {section.type === 'summary' && (
        <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-md border soft-border">
          {Object.entries(section.content).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center border-b border-dotted pb-1">
              <span className="text-sm text-slate-600">{key}:</span>
              <span className="text-sm font-bold text-slate-900">{value as any}</span>
            </div>
          ))}
        </div>
      )}

      {section.type === 'table' && (
        <div className="overflow-x-auto border rounded-md soft-border">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-800 text-white">
              <tr>
                {Object.keys(section.content[0] || {}).map(key => (
                  <th key={key} className="px-3 py-2 font-semibold uppercase">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {section.content.map((row: any, i: number) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  {Object.values(row).map((val: any, j: number) => (
                    <td key={j} className="px-3 py-2 text-slate-700">{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};


