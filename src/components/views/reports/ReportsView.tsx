import React, { useState, useMemo, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ViewType, ViewSettings } from '@/types/ViewTypes'
import { TwoTierHeader } from '@/components/layout/ViewHeader'
import { ReportService } from '@/domain/reporting/services/ReportService'
import { PdfExportService } from '@/domain/reporting/services/PdfExportService'
import { ReportType } from '@/domain/reporting/interfaces/IReport'
import { useProjectStore } from '@/store/projectStore'
import { useHelpContent } from '@/hooks/useHelpContent'
import { useToast } from '@/hooks/use-toast'
import { useUserPreferences } from '@/components/userpreferences/hooks/useUserPreferences'
import { ReportViewer } from './ReportViewer'
import { BarChart3, ListTodo, Users, Milestone, DollarSign, FileText, ArrowLeft, Printer, Download, UserCog } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import '@/styles/reports.css'

/**
 * ReportsView - Система отчетов с полной локализацией
 * Использует TwoTierHeader + Dynamic Accent System.
 * @version 10.0 - Добавлена интернационализация и ручное назначение менеджера
 */
export const ReportsView: React.FC<{ viewType: ViewType; settings?: Partial<ViewSettings> }> = () => {
  const { t } = useTranslation()
  const { toast } = useToast()
  const helpContent = useHelpContent()
  const { preferences } = useUserPreferences()
  const { tasks, resources, currentFilePath, projectManager, setProjectManager } = useProjectStore()

  const [selectedReportType, setSelectedReportType] = useState<ReportType | null>(null)
  const [isEditingManager, setIsEditingManager] = useState(false)
  const [managerInput, setManagerInput] = useState(projectManager || '')
  const reportRef = useRef<HTMLDivElement>(null)

  const reportService = useMemo(() => new ReportService(), [])
  const pdfExportService = useMemo(() => new PdfExportService(), [])

  // Определяем символ валюты на основе настроек
  const currencySymbol = useMemo(() => {
    const currency = preferences.general?.currency || 'RUB'
    const symbols: Record<string, string> = { 'RUB': '₽', 'USD': '$', 'EUR': '€' }
    return symbols[currency] || currency
  }, [preferences.general?.currency])

  // Извлекаем имя проекта из пути к файлу
  const projectName = useMemo(() => {
    if (!currentFilePath) return t('reports.untitled_project')
    const fileName = currentFilePath.split(/[/\\]/).pop() || ''
    return fileName.replace(/\.(pod|mpp|xml)$/i, '') || t('reports.untitled_project')
  }, [currentFilePath, t])

  const reportData = useMemo(() => {
    if (!selectedReportType) return null
    return reportService.generateReportData(selectedReportType, tasks, resources, {
      projectName,
      projectManager,
      t: (key, defaultValue) => t(key, { defaultValue }) as string,
      currencySymbol,
    })
  }, [selectedReportType, tasks, resources, reportService, projectName, projectManager, t, currencySymbol])

  const handleSaveManager = useCallback(() => {
    setProjectManager(managerInput.trim())
    setIsEditingManager(false)
    toast({
      title: t('common.success'),
      description: t('reports.manager_saved', 'Менеджер проекта сохранён'),
    })
  }, [managerInput, setProjectManager, toast, t])

  const reportCards = [
    { type: ReportType.PROJECT_SUMMARY, title: t('reports.project_summary'),
      desc: t('reports.project_summary_desc'), icon: BarChart3, color: 'bg-primary' },
    { type: ReportType.CRITICAL_TASKS, title: t('reports.critical_tasks'),
      desc: t('reports.critical_tasks_desc'), icon: ListTodo, color: 'bg-red-500' },
    { type: ReportType.RESOURCE_USAGE, title: t('reports.resources'),
      desc: t('reports.resources_desc'), icon: Users, color: 'bg-green-500' },
    { type: ReportType.MILESTONE_REPORT, title: t('reports.milestones'),
      desc: t('reports.milestones_desc'), icon: Milestone, color: 'bg-purple-500' },
    { type: ReportType.COST_ANALYSIS, title: t('reports.costs'),
      desc: t('reports.costs_desc'), icon: DollarSign, color: 'bg-amber-500' },
  ]

  const handlePrint = useCallback(() => window.print(), [])

  const handleExport = useCallback(async () => {
    if (!reportRef.current || !reportData) return

    try {
      const filename = `${projectName}_${reportData.type}_${new Date().toISOString().split('T')[0]}`
      const success = await pdfExportService.exportAndSave(reportRef.current, filename)

      if (success) {
        toast({ title: t('common.success'), description: t('reports.export_success') })
      }
    } catch (error) {
      console.error('[ReportsView] PDF export failed:', error)
      toast({ variant: 'destructive', title: t('common.error'), description: t('reports.export_error') })
    }
  }, [reportData, projectName, pdfExportService, toast, t])

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
  ) : null

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
            variant: 'outline',
          },
          controls: reportViewControls,
        } : undefined}
      />

      <div className="flex-1 overflow-hidden p-6">
        {!selectedReportType ? (
          <div className="h-full overflow-auto">
            {/* Секция настройки менеджера проекта */}
            <div className="mb-6 p-4 bg-white rounded-xl border shadow-sm soft-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <UserCog className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{t('reports.manager_label')}</p>
                    {isEditingManager ? (
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          value={managerInput}
                          onChange={(e) => setManagerInput(e.target.value)}
                          placeholder={t('reports.manager_placeholder', 'Введите имя менеджера...')}
                          className="h-8 w-48"
                          autoFocus
                        />
                        <Button size="sm" onClick={handleSaveManager} className="h-8">
                          {t('common.save')}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setIsEditingManager(false)} className="h-8">
                          {t('common.cancel')}
                        </Button>
                      </div>
                    ) : (
                      <p className="text-lg font-semibold text-slate-900">
                        {projectManager || t('reports.manager_not_specified')}
                      </p>
                    )}
                  </div>
                </div>
                {!isEditingManager && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setManagerInput(projectManager || '')
                      setIsEditingManager(true)
                    }}
                    className="h-8"
                  >
                    {t('common.edit')}
                  </Button>
                )}
              </div>
            </div>

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
                      'p-4 rounded-2xl text-white shadow-xl transition-transform group-hover:scale-110 duration-300',
                      card.type === ReportType.PROJECT_SUMMARY ? 'bg-primary shadow-primary/30' : `${card.color} shadow-black/10`,
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
              <ReportViewer data={reportData} reportRef={reportRef} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

