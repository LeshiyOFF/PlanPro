import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { IReportData, IReportSection } from '@/domain/reporting/interfaces/IReport'
import { FileText } from 'lucide-react'
import type { JsonObject } from '@/types/json-types'

import type { JsonValue } from '@/types/json-types'

interface ReportViewerProps {
  data: IReportData;
  reportRef?: React.RefObject<HTMLDivElement>;
}

/**
 * Компонент визуального прогресс-бара для отчётов
 */
const ProgressBar: React.FC<{ value: number; showLabel?: boolean }> = ({ value, showLabel = true }) => {
  const normalizedValue = Math.min(100, Math.max(0, value))
  const getColorClass = () => {
    if (normalizedValue >= 100) return 'bg-green-500'
    if (normalizedValue >= 50) return 'bg-blue-500'
    if (normalizedValue > 0) return 'bg-amber-500'
    return 'bg-slate-300'
  }

  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColorClass()} transition-all duration-300`}
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium w-10 text-right">{normalizedValue}%</span>
      )}
    </div>
  )
}

/**
 * Проверяет, является ли значение процентом (число или строка с %)
 */
const isProgressValue = (key: string, value: unknown): number | null => {
  // Проверяем по ключу (колонка "Прогресс" или "Progress")
  const progressKeys = ['прогресс', 'progress', 'завершения', 'complete']
  const isProgressColumn = progressKeys.some(k => key.toLowerCase().includes(k))

  if (!isProgressColumn) return null

  if (typeof value === 'number') {
    // Если значение от 0 до 1 - это доля, конвертируем в процент
    return value <= 1 ? Math.round(value * 100) : Math.round(value)
  }

  if (typeof value === 'string') {
    // Пытаемся извлечь число из строки типа "50%" или "50"
    const match = value.match(/(\d+(?:\.\d+)?)/)
    if (match) {
      const num = parseFloat(match[1])
      return num <= 1 ? Math.round(num * 100) : Math.round(num)
    }
  }

  return null
}

/**
 * Компонент для отображения сформированного отчета.
 * Кнопки управления вынесены в родительский компонент (TwoTierHeader).
 * @version 2.0 - Добавлены визуальные прогресс-бары
 */
export const ReportViewer: React.FC<ReportViewerProps> = ({ data, reportRef }) => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg border overflow-hidden soft-border">
      {/* Заголовок предварительного просмотра */}
      <div className="flex items-center gap-2 p-4 border-b bg-muted/20 soft-border text-slate-700">
        <FileText className="h-5 w-5" />
        <span className="font-semibold">{t('reports.preview')}</span>
      </div>

      {/* Содержимое отчета (стилизовано под бумажный лист) */}
      <div className="flex-1 overflow-auto p-8 bg-slate-200 flex justify-center">
        <div
          ref={reportRef}
          className="w-[210mm] min-h-[297mm] bg-white shadow-xl p-[20mm] text-slate-900 report-paper border soft-border"
        >
          <header className="border-b pb-4 mb-8 flex justify-between items-start soft-border">
            <div>
              <h1 className="text-3xl font-bold uppercase tracking-tighter mb-1">
                {t('welcome.about_title', { defaultValue: 'ПланПро' }).replace('О программе ', '')}
              </h1>
              <p className="text-sm text-slate-500 italic">Professional Project Management</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-bold">{data.reportTitle}</p>
              <p>{data.generatedAt.toLocaleDateString()} {data.generatedAt.toLocaleTimeString()}</p>
            </div>
          </header>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-bold border-b mb-4">{t('reports.project_info')}</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <p><span className="font-semibold">{t('reports.project_label')}:</span> {data.projectName}</p>
                <p><span className="font-semibold">{t('reports.manager_label')}:</span> {data.projectManager}</p>
              </div>
            </section>

            {data.sections.map((section, idx) => (
              <ReportSection key={idx} section={section} />
            ))}
          </div>

          <footer className="mt-12 pt-4 border-t text-[10px] text-slate-400 text-center soft-border">
            {t('reports.generated_footer')}
          </footer>
        </div>
      </div>
    </div>
  )
}

/**
 * Компонент секции отчёта с поддержкой прогресс-баров
 */
const ReportSection: React.FC<{ section: IReportSection }> = ({ section }) => {
  // Определяем колонки с прогрессом для таблиц
  const progressColumns = useMemo(() => {
    if (section.type !== 'table' || !Array.isArray(section.content) || section.content.length === 0) {
      return new Set<string>()
    }
    const cols = new Set<string>()
    const firstRow = section.content[0] as Record<string, JsonValue>
    Object.keys(firstRow).forEach(key => {
      if (isProgressValue(key, firstRow[key]) !== null) {
        cols.add(key)
      }
    })
    return cols
  }, [section])

  return (
    <section>
      <h3 className="text-lg font-bold text-slate-800 mb-3 uppercase tracking-wide">{section.title}</h3>

      {section.type === 'text' && (
        <p className="text-sm text-slate-600 italic p-4 bg-slate-50/50 rounded-md border soft-border">
          {section.content}
        </p>
      )}

      {section.type === 'summary' && (
        <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-md border soft-border">
          {Object.entries(section.content).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center border-b border-dotted pb-1">
              <span className="text-sm text-slate-600">{key}:</span>
              <span className="text-sm font-bold text-slate-900">{String(value)}</span>
            </div>
          ))}
        </div>
      )}

      {section.type === 'table' && Array.isArray(section.content) && section.content.length > 0 && (
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
              {section.content.map((row: Record<string, JsonValue>, i: number) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  {Object.entries(row).map(([key, val], j: number) => {
                    const progressValue = progressColumns.has(key) ? isProgressValue(key, val) : null

                    return (
                      <td key={j} className="px-3 py-2 text-slate-700">
                        {progressValue !== null ? (
                          <ProgressBar value={progressValue} />
                        ) : (
                          String(val)
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
