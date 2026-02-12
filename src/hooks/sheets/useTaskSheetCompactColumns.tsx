import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ISheetColumn, SheetColumnType } from '@/domain/sheets/interfaces/ISheetColumn'
import { Task } from '@/store/project/interfaces'
import { Lock, Check, X } from 'lucide-react'
import { formatDate } from '@/utils/formatUtils'
import { useTaskEstimation } from '@/hooks/task/useTaskEstimation'

/**
 * Хук для получения колонок компактного варианта TaskSheet
 * Используется в боковых панелях и диалогах выбора задач.
 * При передаче disabledReasons для отключённых строк показывается тултип с причиной.
 */
export const useTaskSheetCompactColumns = (
  disabledTaskIds: string[],
  disabledReasons?: Record<string, string>,
): ISheetColumn<Task>[] => {
  const { t } = useTranslation()
  const { getFormattedName } = useTaskEstimation()

  return useMemo<ISheetColumn<Task>[]>(() => [
    {
      id: 'id', field: 'id', title: t('sheets.id'), width: 45,
      type: SheetColumnType.TEXT, editable: false, visible: true, sortable: true, resizable: true,
      formatter: (_val, row) => {
        const isDisabled = disabledTaskIds.includes(row.id)
        const tooltip = isDisabled && disabledReasons?.[row.id] ? t(disabledReasons[row.id]) : undefined
        return (
          <div className="flex items-center gap-1" title={tooltip}>
            {isDisabled ? (
              <div className="flex items-center">
                <Lock size={10} className="text-slate-400" />
              </div>
            ) : (
              <span className="text-[10px] font-mono text-slate-400">{row.id}</span>
            )}
          </div>
        )
      },
    },
    {
      id: 'name', field: 'name', title: t('sheets.task_info'), width: 215,
      type: SheetColumnType.TEXT, editable: true, visible: true, sortable: true, resizable: true,
      formatter: (_val, row) => {
        const isDisabled = disabledTaskIds.includes(row.id)
        const tooltip = isDisabled && disabledReasons?.[row.id] ? t(disabledReasons[row.id]) : undefined
        return (
        <div className="flex flex-col py-0.5 leading-none overflow-hidden select-none"
          style={{ paddingLeft: `${(row.level - 1) * 12}px` }}
          title={tooltip}>
          <div className="font-bold text-[11px] truncate text-slate-700 mb-1">
            {row.level > 1 && <span className="text-slate-300 mr-1">↳</span>}
            {getFormattedName(row)}
          </div>
          <div className="text-[9px] text-slate-400 flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-primary font-bold bg-primary/10 px-1 rounded-sm flex items-center gap-1">
              {row.isMilestone ? (
                (row.progress ?? 0) >= 0.5
                  ? <><Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />{t('sheets.milestone_completed')}</>
                  : <><X className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />{t('sheets.milestone_pending')}</>
              ) : (
                `${Math.round((row.progress || 0) * 100)}%`
              )}
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-0.5">
              {formatDate(row.startDate)}
              <span className="text-slate-300">→</span>
              {formatDate(row.endDate)}
            </span>
            {row.predecessors && row.predecessors.length > 0 && (
              <>
                <span className="text-slate-300">|</span>
                <span className="text-amber-600 font-medium">🔗 {row.predecessors.join(',')}</span>
              </>
            )}
          </div>
        </div>
        )
      },
    },
  ], [t, disabledTaskIds, disabledReasons, getFormattedName])
}
