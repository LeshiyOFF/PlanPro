import { Task } from '@/store/project/interfaces';
import { Resource } from '@/types/resource-types';
import { IReportData, ReportType, IReportSection } from '../interfaces/IReport';
import { TaskStatsCalculator } from './TaskStatsCalculator';
import { CostCalculator } from './CostCalculator';
import { CostDiagnosticService } from './CostDiagnosticService';

/** Тип функции перевода i18n */
type TranslationFn = (key: string, defaultValue?: string) => string;

/**
 * Опции генерации отчёта
 */
export interface ReportGenerationOptions {
  /** Название проекта */
  projectName: string;
  /** Явно указанный менеджер проекта (приоритет над автоопределением) */
  projectManager?: string;
  /** Функция локализации (i18n) */
  t: TranslationFn;
  /** Символ валюты */
  currencySymbol?: string;
}

/**
 * Сервис для сбора и агрегации данных для отчетов.
 * Clean Architecture: Application Service.
 * SOLID: Single Responsibility - оркестрация генерации отчётов.
 * 
 * @version 3.0 - Добавлена валидация резерва (slack) для критических задач
 */
export class ReportService {
  
  /**
   * Максимальный разумный резерв в днях.
   * Если резерв превышает это значение, он считается "неограниченным".
   * CPM может возвращать огромные значения для задач без successor'ов.
   */
  private static readonly MAX_REASONABLE_SLACK_DAYS = 365 * 5; // 5 лет
  
  private readonly statsCalculator = new TaskStatsCalculator();
  private readonly costCalculator = new CostCalculator();
  private readonly costDiagnostic = new CostDiagnosticService();
  
  /** Текущая функция перевода */
  private t: TranslationFn = (key) => key;
  
  /** Символ валюты */
  private currencySymbol = '₽';

  /**
   * Генерирует данные для конкретного типа отчета.
   * @param type Тип отчёта
   * @param tasks Массив задач проекта
   * @param resources Массив ресурсов проекта
   * @param options Опции генерации (название проекта, менеджер, функция перевода)
   */
  public generateReportData(
    type: ReportType, 
    tasks: Task[], 
    resources: Resource[], 
    options: ReportGenerationOptions
  ): IReportData {
    // Сохраняем функцию перевода и валюту для использования в методах
    this.t = options.t;
    this.currencySymbol = options.currencySymbol || '₽';
    
    // Определяем менеджера: приоритет у явно указанного
    const projectManager = options.projectManager?.trim() 
      ? options.projectManager 
      : this.detectProjectManager(resources);
    
    return {
      generatedAt: new Date(),
      projectName: options.projectName,
      projectManager,
      reportTitle: this.getReportTitle(type),
      type,
      sections: this.generateSections(type, tasks, resources)
    };
  }

  private generateSections(type: ReportType, tasks: Task[], resources: Resource[]): IReportSection[] {
    switch (type) {
      case ReportType.PROJECT_SUMMARY: return this.getProjectSummarySections(tasks, resources);
      case ReportType.CRITICAL_TASKS: return this.getCriticalTasksSections(tasks);
      case ReportType.RESOURCE_USAGE: return this.getResourceUsageSections(resources, tasks);
      case ReportType.MILESTONE_REPORT: return this.getMilestoneSections(tasks);
      case ReportType.COST_ANALYSIS: return this.getCostAnalysisSections(tasks, resources);
      default: return [];
    }
  }

  /**
   * Автоматическое определение менеджера проекта по группе ресурсов.
   * Ищет ресурс типа 'Work' с группой, содержащей 'manager'.
   */
  private detectProjectManager(resources: Resource[]): string {
    const manager = resources.find(r => 
      r.type === 'Work' && r.group?.toLowerCase().includes('manager')
    );
    return manager?.name || this.t('reports.manager_not_specified', 'Не указан');
  }

  private getReportTitle(type: ReportType): string {
    const titleKeys: Record<ReportType, string> = {
      [ReportType.PROJECT_SUMMARY]: 'reports.title_project_summary',
      [ReportType.CRITICAL_TASKS]: 'reports.title_critical_tasks',
      [ReportType.RESOURCE_USAGE]: 'reports.title_resource_usage',
      [ReportType.MILESTONE_REPORT]: 'reports.title_milestone_report',
      [ReportType.COST_ANALYSIS]: 'reports.title_cost_analysis'
    };
    return this.t(titleKeys[type]);
  }

  private getProjectSummarySections(tasks: Task[], resources: Resource[]): IReportSection[] {
    const stats = this.statsCalculator.calculate(tasks);
    return [{
      title: this.t('reports.section_general_stats', 'Общая статистика'), 
      type: 'summary',
      content: {
        [this.t('reports.stat_total_tasks', 'Всего задач')]: stats.total,
        [this.t('reports.stat_completed', 'Завершено')]: `${stats.completed} (${stats.completedPercent}%)`,
        [this.t('reports.stat_in_progress', 'В процессе')]: stats.inProgress,
        [this.t('reports.stat_not_started', 'Не начаты')]: stats.notStarted,
        [this.t('reports.stat_total_resources', 'Всего ресурсов')]: resources.length,
        [this.t('reports.stat_critical_tasks', 'Критических задач')]: stats.critical,
        [this.t('reports.stat_milestones', 'Вех')]: stats.milestones
      }
    }];
  }

  private getCriticalTasksSections(tasks: Task[]): IReportSection[] {
    const criticalTasks = tasks.filter(t => t.isCritical);
    
    if (criticalTasks.length === 0) {
      return [{ 
        title: this.t('reports.title_critical_tasks', 'Критические задачи'), 
        type: 'text', 
        content: this.t('reports.no_critical_tasks', 'Критические задачи не найдены.') 
      }];
    }
    
    return [{
      title: this.t('reports.section_critical_tasks_list', 'Список критических задач'), 
      type: 'table',
      content: criticalTasks.map(t => ({
        [this.t('reports.col_name', 'Название')]: t.name,
        [this.t('reports.col_start', 'Начало')]: new Date(t.startDate).toLocaleDateString(),
        [this.t('reports.col_end', 'Окончание')]: new Date(t.endDate).toLocaleDateString(),
        [this.t('reports.col_progress', 'Прогресс')]: this.statsCalculator.normalizeProgress(t.progress),
        [this.t('reports.col_slack', 'Резерв')]: this.formatSlack(t.totalSlack)
      }))
    }];
  }

  /**
   * Форматирует значение резерва (slack) для отображения в отчёте.
   * Валидирует значение и возвращает читаемую строку.
   * 
   * CPM (Critical Path Method) может возвращать огромные значения резерва
   * для задач, которые не влияют на конечную дату проекта.
   * 
   * @param totalSlack Резерв в днях (может быть undefined или очень большим)
   * @returns Отформатированная строка: "X дн.", "∞" или "—"
   */
  private formatSlack(totalSlack: number | undefined): string {
    const daysShort = this.t('reports.days_short', 'дн.');
    
    // Не определено
    if (totalSlack === undefined || totalSlack === null) {
      return '—';
    }
    
    // Отрицательный резерв (задача просрочена)
    if (totalSlack < 0) {
      return `${Math.round(totalSlack)} ${daysShort}`;
    }
    
    // Нулевой резерв (критический путь)
    if (totalSlack === 0) {
      return `0 ${daysShort}`;
    }
    
    // Резерв больше разумного значения — считаем неограниченным
    if (totalSlack > ReportService.MAX_REASONABLE_SLACK_DAYS) {
      return this.t('reports.slack_unlimited', '∞');
    }
    
    // Нормальное значение — округляем до целых
    return `${Math.round(totalSlack)} ${daysShort}`;
  }

  private getResourceUsageSections(resources: Resource[], tasks: Task[]): IReportSection[] {
    const rateUnit = this.t('reports.rate_per_hour', `${this.currencySymbol}/ч`);
    
    return [{
      title: this.t('reports.section_resource_load', 'Загрузка ресурсов'), 
      type: 'table',
      content: resources.map(r => ({
        [this.t('reports.col_resource_name', 'Имя')]: r.name,
        [this.t('reports.col_type', 'Тип')]: this.translateResourceType(r.type),
        [this.t('reports.col_max_units', 'Макс. единиц')]: `${Math.round((r.maxUnits || 1) * 100)}%`,
        [this.t('reports.col_assigned_tasks', 'Назначено задач')]: this.countAssignedTasks(r.id, tasks),
        [this.t('reports.col_rate', 'Ставка')]: r.standardRate > 0 ? `${r.standardRate} ${rateUnit}` : '—'
      }))
    }];
  }

  private countAssignedTasks(resourceId: string, tasks: Task[]): number {
    return tasks.filter(t => 
      t.resourceAssignments?.some(a => a.resourceId === resourceId) || (() => { const ids = t.resourceAssignments ? t.resourceAssignments.map(a => a.resourceId) : []; return ids.includes(resourceId); })()
    ).length;
  }

  private translateResourceType(type: string): string {
    const typeKeys: Record<string, string> = { 
      'Work': 'reports.resource_type_work', 
      'Material': 'reports.resource_type_material', 
      'Cost': 'reports.resource_type_cost' 
    };
    return this.t(typeKeys[type] || type, type);
  }

  private getMilestoneSections(tasks: Task[]): IReportSection[] {
    const milestones = tasks.filter(t => t.isMilestone);
    
    if (milestones.length === 0) {
      return [{ 
        title: this.t('reports.section_milestones', 'Вехи проекта'), 
        type: 'text', 
        content: this.t('reports.no_milestones', 'Вехи не найдены.') 
      }];
    }
    
    return [{
      title: this.t('reports.section_milestones', 'Вехи проекта'), 
      type: 'table',
      content: milestones.map(m => ({
        [this.t('reports.col_name', 'Название')]: m.name,
        [this.t('reports.col_date', 'Дата')]: new Date(m.endDate).toLocaleDateString(),
        [this.t('reports.col_status', 'Статус')]: this.statsCalculator.normalizeProgress(m.progress) >= 100 
          ? this.t('reports.milestone_achieved', '✓ Достигнута') 
          : this.t('reports.milestone_pending', '○ Ожидается')
      }))
    }];
  }

  private getCostAnalysisSections(tasks: Task[], resources: Resource[]): IReportSection[] {
    const cost = this.costCalculator.calculate(tasks, resources);
    const currency = this.currencySymbol;
    
    const sections: IReportSection[] = [{
      title: this.t('reports.section_cost_analysis', 'Анализ затрат'), 
      type: 'summary',
      content: {
        [this.t('reports.cost_labor', 'Трудозатраты')]: `${cost.laborCost.toLocaleString()} ${currency}`,
        [this.t('reports.cost_material', 'Материалы')]: `${cost.materialCost.toLocaleString()} ${currency}`,
        [this.t('reports.cost_fixed', 'Фиксированные затраты')]: `${cost.fixedCost.toLocaleString()} ${currency}`,
        [this.t('reports.cost_total', 'ИТОГО')]: `${cost.totalCost.toLocaleString()} ${currency}`
      }
    }];
    
    // Добавляем диагностику если затраты = 0
    if (cost.laborCost === 0 || cost.materialCost === 0) {
      const diagnostic = this.costDiagnostic.diagnose(tasks, resources);
      sections.push(this.buildDiagnosticSection(diagnostic, cost));
    }
    
    return sections;
  }

  private buildDiagnosticSection(diag: ReturnType<CostDiagnosticService['diagnose']>, cost: ReturnType<CostCalculator['calculate']>): IReportSection {
    const issues: string[] = [];
    
    if (cost.laborCost === 0) {
      if (diag.summary.workResourcesWithRate === 0) {
        issues.push(this.t('reports.diag_no_rates', '• Ни один трудовой ресурс не имеет ставки'));
      }
      if (diag.summary.tasksWithAssignments === 0) {
        issues.push(this.t('reports.diag_no_assignments', '• Нет назначений ресурсов на задачи'));
      }
      diag.workResourceIssues.slice(0, 3).forEach(i => {
        issues.push(`• ${i.message}`);
      });
    }
    
    if (cost.materialCost === 0 && diag.materialResourceIssues.length > 0) {
      diag.materialResourceIssues.slice(0, 3).forEach(i => {
        issues.push(`• ${i.message}`);
      });
    }
    
    return {
      title: this.t('reports.section_cost_diagnostic', 'Диагностика затрат'),
      type: 'text',
      content: issues.length > 0 
        ? issues.join('\n')
        : this.t('reports.diag_check_data', 'Проверьте корректность исходных данных')
    };
  }
}


