import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ViewType, ViewSettings } from '@/types/ViewTypes';
import { TwoTierHeader } from '@/components/layout/ViewHeader';
import { ReportService } from '@/domain/reporting/services/ReportService';
import { ReportType } from '@/domain/reporting/interfaces/IReport';
import { useProjectStore } from '@/store/projectStore';
import { useHelpContent } from '@/hooks/useHelpContent';
import { ReportViewer } from './ReportViewer';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3, ListTodo, Users, Milestone, DollarSign, FileText, ArrowLeft, Printer, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import '@/styles/reports.css';

/**
 * ReportsView - Система отчетов
 * 
 * Использует TwoTierHeader + Dynamic Accent System.
 * 
 * @version 8.14
 */
export const ReportsView: React.FC<{ viewType: ViewType; settings?: Partial<ViewSettings> }> = ({ 
  viewType 
}) => {
  const { t } = useTranslation();
  const helpContent = useHelpContent();
  const { tasks, resources } = useProjectStore();
  const [selectedReportType, setSelectedReportType] = useState<ReportType | null>(null);
  const reportService = useMemo(() => new ReportService(), []);

  const reportData = useMemo(() => {
    if (!selectedReportType) return null;
    return reportService.generateReportData(selectedReportType, tasks, resources);
  }, [selectedReportType, tasks, resources, reportService]);

  const reportCards = [
    {
      type: ReportType.PROJECT_SUMMARY,
      title: t('reports.project_summary'),
      desc: t('reports.project_summary_desc'),
      icon: BarChart3,
      color: 'bg-primary'
    },
    {
      type: ReportType.CRITICAL_TASKS,
      title: t('reports.critical_tasks'),
      desc: t('reports.critical_tasks_desc'),
      icon: ListTodo,
      color: 'bg-red-500'
    },
    {
      type: ReportType.RESOURCE_USAGE,
      title: t('reports.resources'),
      desc: t('reports.resources_desc'),
      icon: Users,
      color: 'bg-green-500'
    },
    {
      type: ReportType.MILESTONE_REPORT,
      title: t('reports.milestones'),
      desc: t('reports.milestones_desc'),
      icon: Milestone,
      color: 'bg-purple-500'
    },
    {
      type: ReportType.COST_ANALYSIS,
      title: t('reports.costs'),
      desc: t('reports.costs_desc'),
      icon: DollarSign,
      color: 'bg-amber-500'
    }
  ];

  const handlePrint = () => window.print();
  const handleExport = () => console.log("Exporting to PDF...");

  const reportViewControls = selectedReportType ? (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handlePrint} className="h-9 hover:bg-primary/5 soft-border">
        <Printer className="w-4 h-4 mr-1" />
        {t('ribbon.buttons.print')}
      </Button>
      <Button variant="outline" size="sm" onClick={handleExport} className="h-9 hover:bg-primary/5 soft-border">
        <Download className="w-4 h-4 mr-1" />
        {t('common.export')}
      </Button>
    </div>
  ) : null;

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <TwoTierHeader
        title={t('navigation.reports')}
        description={t('descriptions.reports')}
        icon={<FileText />}
        help={helpContent.REPORTS}
        actionBar={selectedReportType ? {
          primaryAction: {
            label: t('errors.back'),
            onClick: () => setSelectedReportType(null),
            icon: <ArrowLeft className="w-4 h-4" />,
            variant: 'outline'
          },
          controls: reportViewControls
        } : undefined}
      />

      <div className="flex-1 overflow-hidden p-6">
        {!selectedReportType ? (
          <div className="h-full overflow-auto">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full" />
              {t('reports.select_type')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reportCards.map((card) => (
                <div 
                  key={card.type}
                  className="cursor-pointer bg-white rounded-xl border shadow-lg hover:shadow-xl hover:border-primary/30 transition-all duration-300 group p-2 soft-border"
                  onClick={() => setSelectedReportType(card.type)}
                >
                  <div className="flex items-center gap-5 p-4">
                    <div className={cn(
                      "p-4 rounded-2xl text-white shadow-xl transition-transform group-hover:scale-110 duration-300",
                      card.type === ReportType.PROJECT_SUMMARY ? "bg-primary shadow-primary/30" : `${card.color} shadow-black/10`
                    )}>
                      <card.icon className="h-7 w-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-800 group-hover:text-primary transition-colors mb-1">
                        {card.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 font-medium leading-relaxed opacity-80">
                        {card.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full bg-white rounded-xl shadow-lg border overflow-hidden transition-all soft-border">
            {reportData && (
              <ReportViewer 
                data={reportData} 
                onPrint={handlePrint}
                onExport={handleExport}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
