import React from 'react'
import { TFunction } from 'i18next'
import { IHelpSection } from '@/types/help'
import { FileText, Printer, User } from 'lucide-react'

/**
 * Контент справки для секции REPORTS (Отчёты)
 */
export const getReportsHelpSection = (t: TFunction): IHelpSection => ({
  title: t('help.reports.title', 'Отчёты'),
  subtitle: t('help.reports.subtitle', 'Сводная информация по проекту'),
  icon: <FileText size={24} />,
  blocks: [
    {
      title: t('help.reports.types.title', 'Типы отчётов'),
      icon: <FileText size={20} />,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      content: (
        <div className="space-y-2">
          <p><strong>{t('help.reports.types.project', 'По проекту:')}</strong> {t('help.reports.types.projectDesc', 'Общая информация, сроки, бюджет')}</p>
          <p><strong>{t('help.reports.types.resources', 'По ресурсам:')}</strong> {t('help.reports.types.resourcesDesc', 'Загрузка, стоимость, календари')}</p>
          <p><strong>{t('help.reports.types.tasks', 'По задачам:')}</strong> {t('help.reports.types.tasksDesc', 'Критический путь, задержки, milestone')}</p>
          <p><strong>{t('help.reports.types.export', 'Экспорт:')}</strong> {t('help.reports.types.exportDesc', 'PDF (через Print/Export кнопки)')}</p>
        </div>
      ),
    },
    {
      title: t('help.reports.management.title', 'Управление отчётами'),
      icon: <Printer size={20} />,
      iconColor: 'text-slate-600',
      iconBg: 'bg-slate-100',
      content: (
        <div className="space-y-2">
          <p className="flex items-center gap-2"><Printer size={16} className="flex-shrink-0" /> <strong>{t('help.reports.management.print', 'Печать:')}</strong> {t('help.reports.management.printDesc', 'Кнопка Print открывает системный диалог печати')}</p>
          <p className="flex items-center gap-2"><FileText size={16} className="flex-shrink-0" /> <strong>{t('help.reports.management.pdf', 'Экспорт PDF:')}</strong> {t('help.reports.management.pdfDesc', 'Сохранение отчёта в файл PDF')}</p>
          <p className="flex items-center gap-2"><User size={16} className="flex-shrink-0" /> <strong>{t('help.reports.management.manager', 'Менеджер проекта:')}</strong> {t('help.reports.management.managerDesc', 'Можно указать ФИО руководителя для отчётов')}</p>
        </div>
      ),
    },
  ],
})
