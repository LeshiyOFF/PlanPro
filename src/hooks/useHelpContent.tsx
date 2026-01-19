import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Хук для получения локализованного контента справки.
 */
export const useHelpContent = () => {
  const { t } = useTranslation();

  return {
    GANTT: {
      title: t('help.gantt_title'),
      content: (
        <>
          <p>{t('help.gantt_desc_1', 'Основной инструмент планирования графиков задач.')}</p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>{t('help.gantt_item_1_bold', 'Синие полоски:')}</strong> {t('help.gantt_item_1_text', 'обычные задачи.')}</li>
            <li><strong>{t('help.gantt_item_2_bold', 'Черные скобки:')}</strong> {t('help.gantt_item_2_text', 'суммарные задачи (группы).')}</li>
            <li><strong>{t('help.gantt_item_3_bold', 'Красные полоски:')}</strong> {t('help.gantt_item_3_text', 'задачи на критическом пути.')}</li>
            <li><strong>{t('help.gantt_item_4_bold', 'Стрелки:')}</strong> {t('help.gantt_item_4_text', 'зависимости между задачами (FS, SS, FF, SF).')}</li>
          </ul>
          <p className="mt-2 text-[10px] italic">{t('help.gantt_tip', 'Совет: Перетаскивайте края полосок для изменения длительности.')}</p>
        </>
      )
    },
    NETWORK: {
      title: t('help.network_title'),
      content: (
        <>
          <p>{t('help.network_desc_1', 'Визуализация логической структуры проекта и зависимостей.')}</p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>{t('help.network_item_1_bold', 'Узлы:')}</strong> {t('help.network_item_1_text', 'представляют задачи с датами старта и финиша.')}</li>
            <li><strong>{t('help.network_item_2_bold', 'Красная обводка:')}</strong> {t('help.network_item_2_text', 'критические задачи.')}</li>
            <li><strong>{t('help.network_item_3_bold', 'Линии:')}</strong> {t('help.network_item_3_text', 'связи. Направление стрелки указывает на последовательность.')}</li>
          </ul>
          <p className="mt-2 text-[10px] italic">{t('help.network_tip', 'Совет: Используйте этот вид для анализа «узких мест» в логике проекта.')}</p>
        </>
      )
    },
    WBS: {
      title: t('help.wbs_title'),
      content: (
        <>
          <p>{t('help.wbs_desc_1', 'Иерархическая декомпозиция проекта.')}</p>
          <p>{t('help.wbs_desc_2', 'Помогает организовать объем работ в виде древовидной структуры.')}</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>{t('help.wbs_item_1', 'Верхний уровень — весь проект.')}</li>
            <li>{t('help.wbs_item_2', 'Нижние уровни — конкретные пакеты работ.')}</li>
          </ul>
        </>
      )
    },
    RESOURCE_USAGE: {
      title: t('help.resource_usage_title'),
      content: (
        <>
          <p>{t('help.resource_usage_desc_1', 'Анализ загрузки сотрудников и оборудования.')}</p>
          <p>{t('help.resource_usage_desc_2', 'Красные индикаторы сигнализируют о <strong>перегрузке</strong> (overallocation).')}</p>
          <p className="mt-1">{t('help.resource_usage_desc_3', 'Позволяет увидеть распределение трудозатрат по времени.')}</p>
        </>
      )
    },
    TASK_USAGE: {
      title: t('help.task_usage_title'),
      content: (
        <>
          <p>{t('help.task_usage_desc_1', 'Детальный анализ выполнения работ по каждой задаче.')}</p>
          <p>{t('help.task_usage_desc_2', 'Помогает отслеживать фактические трудозатраты и остаточную работу.')}</p>
          <ul className="list-disc pl-4 space-y-1 mt-1">
            <li><strong>{t('help.task_usage_item_1_bold', 'Статус:')}</strong> {t('help.task_usage_item_1_text', 'визуальное деление на завершенные и активные задачи.')}</li>
            <li><strong>{t('help.task_usage_item_2_bold', 'Ресурсы:')}</strong> {t('help.task_usage_item_2_text', 'список всех назначений для каждой задачи.')}</li>
          </ul>
        </>
      )
    },
    TRACKING: {
      title: t('help.tracking_title'),
      content: (
        <>
          <p>{t('help.tracking_desc_1', 'Сравнение текущего прогресса с <strong>базовым планом</strong>.')}</p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>{t('help.tracking_item_1_bold', 'Нижняя серая полоса:')}</strong> {t('help.tracking_item_1_text', 'базовый план (состояние на момент начала).')}</li>
            <li><strong>{t('help.tracking_item_2_bold', 'Верхняя полоса:')}</strong> {t('help.tracking_item_2_text', 'текущий статус выполнения.')}</li>
            <li><strong>{t('help.tracking_item_3_bold', 'Процент:')}</strong> {t('help.tracking_item_3_text', 'доля выполненной работы.')}</li>
          </ul>
          <p className="mt-2 text-[10px] italic">{t('help.tracking_tip', 'Совет: Это лучший вид для выявления отклонений от графика.')}</p>
        </>
      )
    }
  };
};

