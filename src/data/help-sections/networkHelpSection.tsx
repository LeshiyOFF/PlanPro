import React from 'react'
import { TFunction } from 'i18next'
import { IHelpSection } from '@/types/help'
import { Network, Eye, Wand, Activity, MousePointer2, Layout, Search, ArrowRight, Layers } from 'lucide-react'

/**
 * Контент справки для секции NETWORK (Сетевая диаграмма)
 */
export const getNetworkHelpSection = (t: TFunction): IHelpSection => ({
  title: t('help.network.title', 'Сетевая диаграмма'),
  subtitle: t('help.network.subtitle', 'Анализ логики проекта'),
  icon: <Network size={24} />,
  blocks: [
    {
      title: t('help.network.what.title', 'Что это'),
      icon: <Network size={20} />,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      content: (
        <div className="space-y-2">
          <p><strong>{t('help.network.what.nodes', 'Узлы:')}</strong> {t('help.network.what.nodesDesc', 'Прямоугольники с названием задачи, датами начала и окончания')}</p>
          <p><strong>{t('help.network.what.arrows', 'Стрелки:')}</strong> {t('help.network.what.arrowsDesc', 'Показывают последовательность выполнения работ')}</p>
          <p><strong>{t('help.network.what.critical', 'Критический путь:')}</strong> {t('help.network.what.criticalDesc', 'Узлы с красной обводкой')}</p>
          <p className="text-xs italic text-slate-500">{t('help.network.what.goal', 'Цель: Анализ логики проекта, поиск "узких мест"')}</p>
        </div>
      ),
    },
    {
      title: t('help.network.reading.title', 'Как читать диаграмму'),
      icon: <Eye size={20} />,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      content: (
        <div className="space-y-2">
          <p><ArrowRight size={14} className="inline-block mr-1.5 mb-0.5" /> {t('help.network.reading.sequential', 'Стрелка вправо — последовательная зависимость')}</p>
          <p><Layers size={14} className="inline-block mr-1.5 mb-0.5" /> {t('help.network.reading.parallel', 'Параллельные узлы без связей — задачи можно выполнять одновременно')}</p>
          <p className="text-red-600 font-medium"><Activity size={14} className="inline-block mr-1.5 mb-0.5 text-red-600" /> {t('help.network.reading.critical', 'Длинная цепочка красных узлов — критический путь (срыв любой задачи сдвинет весь проект)')}</p>
        </div>
      ),
    },
    {
      title: t('help.network.features.title', 'Возможности'),
      icon: <Wand size={20} />,
      iconColor: 'text-violet-600',
      iconBg: 'bg-violet-50',
      content: (
        <div className="space-y-2">
          <p><MousePointer2 size={14} className="inline-block mr-1.5 mb-0.5" /> {t('help.network.features.doubleClick', 'Двойной клик на узел → открытие свойств задачи')}</p>
          <p><Layout size={14} className="inline-block mr-1.5 mb-0.5" /> {t('help.network.features.layout', 'Авто-расстановка узлов (кнопка "Layout")')}</p>
          <p><Search size={14} className="inline-block mr-1.5 mb-0.5" /> {t('help.network.features.zoom', 'Zoom для больших проектов')}</p>
        </div>
      ),
    },
  ],
})
