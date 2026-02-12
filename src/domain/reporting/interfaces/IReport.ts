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
  /** Название компании из настроек пользователя */
  companyName?: string;
  reportTitle: string;
  type: ReportType;
  sections: IReportSection[];
}

/** Допустимое содержимое секции отчета */
export type ReportSectionContent =
  | string
  | Record<string, string | number | boolean | null | undefined>
  | Array<Record<string, string | number | boolean | null | undefined>>;

/**
 * Секция отчета
 */
export interface IReportSection {
  title: string;
  type: 'table' | 'text' | 'chart' | 'summary';
  content: ReportSectionContent;
}


