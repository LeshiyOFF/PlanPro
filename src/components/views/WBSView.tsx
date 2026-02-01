import React, { useState, useMemo, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { TwoTierHeader } from '@/components/layout/ViewHeader'
import { WBSCanvasCore, WBSCanvasHandle } from '@/components/gantt/WBSCanvasCore'
import { WBSNode } from '@/domain/wbs/interfaces/WBS'
import { WBSCodeService } from '@/domain/wbs/services/WBSCodeService'
import { useProjectStore, createTaskFromView } from '@/store/projectStore'
import { useHelpContent } from '@/hooks/useHelpContent'
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Share2,
  Plus,
  Network,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { getElectronAPI } from '@/utils/electronAPI'
import type { JsonObject, JsonValue } from '@/types/json-types'

/**
 * Work Breakdown Structure (WBS) View - СДР (Структура декомпозиции работ)
 *
 * Визуализирует иерархическую структуру работ проекта в виде дерева.
 * Использует TwoTierHeader для визуальной консистентности (Этап 7.23).
 *
 * @version 8.15
 */
export const WBSView: React.FC = () => {
  const { t } = useTranslation()
  const { tasks, addTask } = useProjectStore()
  const { toast } = useToast()
  const helpContent = useHelpContent()
  const [zoom, setZoom] = useState(1)
  const [isExporting, setIsExporting] = useState(false)
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set())

  const wbsCanvasRef = useRef<WBSCanvasHandle>(null)

  /**
   * Расчет длительности для ветви
   */
  const calculateDuration = useCallback((taskId: string): string => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return `0${t('sheets.days')}`

    const start = new Date(task.startDate)
    const end = new Date(task.endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
    return `${days}${t('sheets.days')}`
  }, [tasks, t])

  // Преобразование задач проекта в узлы WBS
  const wbsNodes: WBSNode[] = useMemo(() => {
    const nodes: WBSNode[] = tasks.map((task, index) => {
      let parentId: string | undefined = undefined
      if (task.level > 0) {
        for (let i = index - 1; i >= 0; i--) {
          if (tasks[i].level < task.level) {
            parentId = tasks[i].id
            break
          }
        }
        if (!parentId && tasks[0].level === 0) parentId = tasks[0].id
      }

      return {
        id: task.id,
        name: task.name,
        wbsCode: '',
        level: task.level,
        parentId,
        isExpanded: !collapsedNodes.has(task.id),
        isSummary: !!task.isSummary,
        progress: task.progress,
        startDate: new Date(task.startDate),
        endDate: new Date(task.endDate),
        duration: calculateDuration(task.id),
        critical: !!(task.isCritical ?? task.criticalPath),
        color: task.color,
        childrenIds: [],
        x: 0, y: 0, width: 180, height: 90,
      }
    })

    nodes.forEach(node => {
      if (node.parentId) {
        const parent = nodes.find(n => n.id === node.parentId)
        if (parent) parent.childrenIds.push(node.id)
      }
    })

    return WBSCodeService.calculateCodes(nodes)
  }, [tasks, collapsedNodes, calculateDuration])

  // Видимые узлы (с учетом свернутых)
  const visibleNodes = useMemo(() => {
    return wbsNodes.filter(node => {
      let currentParentId = node.parentId
      while (currentParentId) {
        if (collapsedNodes.has(currentParentId)) return false
        const parent = wbsNodes.find(n => n.id === currentParentId)
        currentParentId = parent?.parentId
      }
      return true
    })
  }, [wbsNodes, collapsedNodes])

  const handleNodeToggle = useCallback((nodeId: string) => {
    setCollapsedNodes(prev => {
      const next = new Set(prev)
      if (next.has(nodeId)) next.delete(nodeId)
      else next.add(nodeId)
      return next
    })
  }, [])

  const handleAddTask = () => {
    const newId = `TASK-${String(tasks.length + 1).padStart(3, '0')}`
    addTask(createTaskFromView({
      id: newId,
      name: t('wbs.new_task_name', { number: tasks.length + 1 }),
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      progress: 0,
      color: 'hsl(var(--primary))',
      level: 1,
    }))
  }

  /**
   * Экспорт СДР в изображение через Electron API
   */
  const handleExport = async () => {
    if (!wbsCanvasRef.current || isExporting) return
    const api = getElectronAPI()
    if (!api?.showSaveDialog || !api?.saveBinaryFile) return
    try {
      setIsExporting(true)
      const result = await api.showSaveDialog({
        title: t('wbs.export_dialog_title') || 'Экспорт СДР',
        defaultPath: `WBS_${new Date().toISOString().split('T')[0]}.png`,
        filters: [{ name: 'Images', extensions: ['png'] }],
      } as Record<string, JsonObject>)
      if (result.canceled || !result.filePath) {
        setIsExporting(false)
        return
      }
      const blob = await wbsCanvasRef.current.exportToBlob(2)
      const arrayBuffer = await blob.arrayBuffer()
      const saveResult = await api.saveBinaryFile(result.filePath, arrayBuffer)
      if (saveResult.success) {
        toast({
          title: t('common.success') || 'Успех',
          description: t('wbs.export_success_message') || 'СДР успешно экспортирована в файл',
        })
      } else {
        throw new Error(saveResult.error)
      }
    } catch (error) {
      console.error('WBS Export failed:', error)
      toast({
        variant: 'destructive',
        title: t('common.error') || 'Ошибка',
        description: t('wbs.export_error_message') || 'Не удалось экспортировать СДР',
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Контролы масштабирования для правой части ActionBar
  const zoomControls = (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setZoom(z => Math.min(z + 0.1, 2))}
        title={t('help.zoom_in')}
        className="h-9 w-9 p-0 border-border/40 hover:bg-[hsl(var(--primary-soft))] text-primary transition-all"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))}
        title={t('help.zoom_out')}
        className="h-9 w-9 p-0 border-border/40 hover:bg-[hsl(var(--primary-soft))] text-primary transition-all"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setZoom(1)}
        title={t('help.zoom_reset')}
        className="h-9 w-9 p-0 border-border/40 hover:bg-[hsl(var(--primary-soft))] text-primary transition-all"
      >
        <Maximize className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Two-Tier Header: Заголовок + Панель действий */}
      <TwoTierHeader
        title={t('wbs.title')}
        description={t('descriptions.wbs')}
        icon={<Network className="w-6 h-6" />}
        help={helpContent.WBS}
        actionBar={{
          primaryAction: {
            label: t('wbs.add_task_button'),
            onClick: handleAddTask,
            icon: <Plus className="w-4 h-4" />,
          },
          secondaryActions: [
            {
              label: isExporting ? t('common.exporting') || 'Экспорт...' : t('wbs.export_button'),
              onClick: handleExport,
              icon: isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />,
              variant: 'outline',
              disabled: isExporting,
            },
          ],
          controls: zoomControls,
        }}
      />

      {/* Основной контент: WBS Canvas */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full w-full bg-white rounded-xl shadow-lg border overflow-hidden transition-all soft-border">
          <WBSCanvasCore
            ref={wbsCanvasRef}
            nodes={visibleNodes}
            zoomLevel={zoom}
            onNodeToggle={handleNodeToggle}
            onNodeSelect={(id) => console.log('Selected:', id)}
          />
        </div>
      </div>
    </div>
  )
}
