import { Task, useProjectStore } from '@/store/projectStore';
import { IReportData, ReportType, IReportSection } from '../interfaces/IReport';

/**
 * Сервис для сбора и агрегации данных для отчетов
 */
export class ReportService {
  /**
   * Генерирует данные для конкретного типа отчета
   */
  public generateReportData(type: ReportType, tasks: Task[], resources: any[]): IReportData {
    const data: IReportData = {
      generatedAt: new Date(),
      projectName: 'Проект ProjectLibre',
      projectManager: 'Администратор',
      reportTitle: this.getReportTitle(type),
      type,
      sections: []
    };

    switch (type) {
      case ReportType.PROJECT_SUMMARY:
        data.sections = this.getProjectSummarySections(tasks, resources);
        break;
      case ReportType.CRITICAL_TASKS:
        data.sections = this.getCriticalTasksSections(tasks);
        break;
      case ReportType.RESOURCE_USAGE:
        data.sections = this.getResourceUsageSections(resources);
        break;
    }

    return data;
  }

  private getReportTitle(type: ReportType): string {
    const titles = {
      [ReportType.PROJECT_SUMMARY]: 'Сводный отчет по проекту',
      [ReportType.CRITICAL_TASKS]: 'Критические задачи',
      [ReportType.RESOURCE_USAGE]: 'Использование ресурсов',
      [ReportType.MILESTONE_REPORT]: 'Отчет по вехам',
      [ReportType.COST_ANALYSIS]: 'Анализ затрат'
    };
    return titles[type];
  }

  private getProjectSummarySections(tasks: Task[], resources: any[]): IReportSection[] {
    const completedTasks = tasks.filter(t => (t.progress || 0) >= 1).length;
    const totalTasks = tasks.length;
    
    return [
      {
        title: 'Общая статистика',
        type: 'summary',
        content: {
          'Всего задач': totalTasks,
          'Завершено': `${completedTasks} (${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%)`,
          'Всего ресурсов': resources.length,
          'Критических задач': tasks.filter(t => t.critical).length
        }
      }
    ];
  }

  private getCriticalTasksSections(tasks: Task[]): IReportSection[] {
    const criticalTasks = tasks.filter(t => t.critical);
    return [
      {
        title: 'Список критических задач',
        type: 'table',
        content: criticalTasks.map(t => ({
          'ID': t.id,
          'Название': t.name,
          'Начало': new Date(t.startDate).toLocaleDateString(),
          'Окончание': new Date(t.endDate).toLocaleDateString(),
          'Прогресс': `${Math.round((t.progress || 0) * 100)}%`
        }))
      }
    ];
  }

  private getResourceUsageSections(resources: any[]): IReportSection[] {
    return [
      {
        title: 'Загрузка ресурсов',
        type: 'table',
        content: resources.map(r => ({
          'Имя': r.name,
          'Тип': r.type,
          'Единицы': `${(r.maxUnits || 0) * 100}%`,
          'Статус': r.available ? 'Доступен' : 'Недоступен'
        }))
      }
    ];
  }
}

