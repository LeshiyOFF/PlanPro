/**
 * Типы доступных отчетов
 */
export enum ReportType {
  PROJECT_SUMMARY = 'project_summary',
  CRITICAL_TASKS = 'critical_tasks',
  RESOURCE_USAGE = 'resource_usage',
  MILESTONE_REPORT = 'milestone_report',
  COST_ANALYSIS = 'cost_analysis'
}

/**
 * Базовый интерфейс данных отчета
 */
export interface IReportData {
  generatedAt: Date;
  projectName: string;
  projectManager: string;
  reportTitle: string;
  type: ReportType;
  sections: IReportSection[];
}

/**
 * Секция отчета
 */
export interface IReportSection {
  title: string;
  type: 'table' | 'text' | 'chart' | 'summary';
  content: any;
}


