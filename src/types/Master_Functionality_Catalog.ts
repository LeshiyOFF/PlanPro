// Master Functionality Catalog - ProjectLibre React Migration
// Полный каталог всех интерфейсов и типов для 100% сохранения функциональности

import type { TaskSegment } from './task-types'
import type { JsonObject } from './json-types'

// ============================================================================
// БАЗОВЫЕ ТИПЫ ДАННЫХ
// ============================================================================

export type { TaskSegment }

export interface ID {
  value: number;
  type: 'task' | 'resource' | 'project' | 'calendar' | 'assignment';
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface Duration {
  value: number;
  unit: 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
}

export interface Percentage {
  value: number; // 0-100
}

export interface Currency {
  amount: number;
  code: string; // USD, EUR, RUB, etc.
}

// ============================================================================
// ПРОЕКТ
// ============================================================================

export interface Project {
  id: ID;
  name: string;
  description?: string;
  startDate: Date;
  finishDate?: Date;
  status: ProjectStatus;
  priority: ProjectPriority;
  calendar: Calendar;
  tasks: Task[];
  resources: Resource[];
  assignments: Assignment[];
  constraints: ProjectConstraint[];
  properties: ProjectProperties;
}

export enum ProjectStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled'
}

export enum ProjectPriority {
  LOWEST = 0,
  LOW = 500,
  MEDIUM = 750,
  HIGH = 1000,
  HIGHEST = 1500
}

export interface ProjectProperties {
  manager?: string;
  company?: string;
  keywords?: string[];
  defaultTaskType: TaskType;
  defaultDurationUnit: Duration['unit'];
  defaultCalendar: Calendar;
  fiscalYearStart: number;
  currency: Currency;
  statistics: ProjectStatistics;
}

export interface ProjectStatistics {
  totalTasks: number;
  completedTasks: number;
  totalDuration: Duration;
  totalCost: Currency;
  workComplete: Percentage;
  budget?: Currency;
  actualCost?: Currency;
}

export interface ProjectConstraint {
  type: ConstraintType;
  date?: Date;
  duration?: Duration;
}

export enum ConstraintType {
  AS_SOON_AS_POSSIBLE = 'asap',
  AS_LATE_AS_POSSIBLE = 'alap',
  MUST_START_ON = 'mso',
  MUST_FINISH_ON = 'mfo',
  START_NO_EARLIER_THAN = 'snet',
  START_NO_LATER_THAN = 'snlt',
  FINISH_NO_EARLIER_THAN = 'fnet',
  FINISH_NO_LATER_THAN = 'fnlt'
}

// ============================================================================
// ЗАДАЧИ
// ============================================================================

export interface Task {
  id: ID;
  name: string;
  description?: string;
  wbs: string; // Work Breakdown Structure
  level: number; // Уровень в иерархии
  position: number; // Позиция среди sibling
  parent?: Task;
  children: Task[];
  type: TaskType;
  status: TaskStatus;
  priority: ProjectPriority;
  dates: TaskDates;
  duration: Duration;
  completion: Percentage;
  work?: Duration; // Трудозатраты
  cost: TaskCost;
  resources: Assignment[];
  predecessors: Dependency[];
  successors: Dependency[];
  constraints: TaskConstraint[];
  notes: string;
  milestones: Milestone[];
  customFields: CustomField[];
  isCritical: boolean;
  isMilestone: boolean;
  isSummary: boolean;
  isExternal: boolean;
}

export enum TaskType {
  FIXED_UNITS = 'fixed_units',
  FIXED_DURATION = 'fixed_duration',
  FIXED_WORK = 'fixed_work'
}

export enum TaskStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DEFERRED = 'deferred'
}

export interface TaskDates {
  scheduled: DateRange;
  actual?: DateRange;
  baseline?: DateRange;
  early: DateRange;
  late: DateRange;
  start?: Date;
  finish?: Date;
  segments?: TaskSegment[];
}

export interface TaskCost {
  fixed: Currency;
  variable: Currency;
  total: Currency;
  baseline?: Currency;
  actual?: Currency;
  remaining: Currency;
}

export interface TaskConstraint extends ProjectConstraint {
  taskId: ID;
}

// ============================================================================
// ЗАВИСИМОСТИ
// ============================================================================

export interface Dependency {
  id: ID;
  predecessor: Task;
  successor: Task;
  type: DependencyType;
  lag?: Duration;
  lead?: Duration;
}

export enum DependencyType {
  FINISH_TO_START = 'fs',
  START_TO_START = 'ss',
  FINISH_TO_FINISH = 'ff',
  START_TO_FINISH = 'sf'
}

// ============================================================================
// РЕСУРСЫ
// ============================================================================

export interface Resource {
  id: ID;
  name: string;
  type: ResourceType;
  initials: string;
  group?: string;
  code?: string;
  email?: string;
  phone?: string;
  calendar: Calendar;
  cost: ResourceCost;
  availability: ResourceAvailability;
  properties: ResourceProperties;
  assignments: Assignment[];
  customFields: CustomField[];
  isActive: boolean;
}

export enum ResourceType {
  WORK = 'work',
  MATERIAL = 'material',
  COST = 'cost'
}

export interface ResourceCost {
  standardRate: Currency; // Стоимость в час
  overtimeRate: Currency; // Стоимость сверхурочных
  costPerUse: Currency; // Стоимость за использование
  accrual: CostAccrualType;
}

export enum CostAccrualType {
  START = 'start',
  PRORATED = 'prorated',
  END = 'end'
}

export interface ResourceAvailability {
  available: boolean;
  availableFrom?: Date;
  availableTo?: Date;
  maxUnits: Percentage; // Максимальная загрузка в %
  normalUnits: Percentage; // Нормальная загрузка в %
  exceptions: AvailabilityException[];
}

export interface AvailabilityException {
  startDate: Date;
  endDate: Date;
  available: boolean;
  units?: Percentage;
}

export interface ResourceProperties {
  department?: string;
  title?: string;
  location?: string;
  skills: string[];
  certifications: string[];
  manager?: Resource;
}

// ============================================================================
// НАЗНАЧЕНИЯ РЕСУРСОВ
// ============================================================================

export interface Assignment {
  id: ID;
  task: Task;
  resource: Resource;
  units: Percentage; // Загрузка ресурса на задаче
  work: Duration; // Запланированные трудозатраты
  actualWork?: Duration; // Фактические трудозатраты
  remainingWork: Duration;
  cost: AssignmentCost;
  dates: AssignmentDates;
  notes?: string;
  confirmed: boolean;
  responsePending: boolean;
}

export interface AssignmentCost {
  planned: Currency;
  actual: Currency;
  remaining: Currency;
  baseline: Currency;
}

export interface AssignmentDates {
  start: Date;
  finish: Date;
  actualStart?: Date;
  actualFinish?: Date;
}

// ============================================================================
// КАЛЕНДАРИ
// ============================================================================

export interface Calendar {
  id: ID;
  name: string;
  type: CalendarType;
  baseCalendar?: Calendar;
  workingTimes: WorkingTime[];
  exceptions: CalendarException[];
  timeZone: string;
  isBase: boolean;
}

export enum CalendarType {
  BASE = 'base',
  PROJECT = 'project',
  RESOURCE = 'resource',
  TASK = 'task'
}

export interface WorkingTime {
  dayOfWeek: DayOfWeek;
  workingPeriods: WorkPeriod[];
}

export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6
}

export interface WorkPeriod {
  start: string; // HH:mm format
  end: string; // HH:mm format
}

export interface CalendarException {
  startDate: Date;
  endDate: Date;
  name: string;
  workingTime?: WorkingTime;
  recurrence?: RecurrencePattern;
}

export interface RecurrencePattern {
  frequency: RecurrenceFrequency;
  interval: number;
  endDate?: Date;
  occurrences?: number;
  daysOfWeek?: DayOfWeek[];
  dayOfMonth?: number;
  month?: number;
}

export enum RecurrenceFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

// ============================================================================
// ВЬЮ И ОТОБРАЖЕНИЕ
// ============================================================================

export interface View {
  id: ID;
  name: string;
  type: ViewType;
  configuration: ViewConfiguration;
  isVisible: boolean;
  isActive: boolean;
}

export enum ViewType {
  GANTT = 'gantt',
  NETWORK = 'network',
  TASK_SHEET = 'task-sheet',
  RESOURCE_SHEET = 'resource-sheet',
  TASK_USAGE = 'task-usage',
  RESOURCE_USAGE = 'resource-usage',
  CALENDAR = 'calendar',
  REPORTS = 'reports',
  TRACKING_GANTT = 'tracking-gantt',
  WBS = 'wbs',
  SETTINGS = 'settings',
  DETAILS = 'details'
}

export interface ViewConfiguration {
  // Общие настройки
  scale: TimeScale;
  filters: Filter[];
  groups: GroupDefinition[];
  sorts: SortDefinition[];

  // Специфичные для Gantt
  gantt?: GanttConfiguration;

  // Специфичные для таблиц
  table?: TableConfiguration;

  // Специфичные для графиков
  chart?: ChartConfiguration;
}

export interface TimeScale {
  unit: TimeUnit;
  count: number;
  zoomLevel: number;
  showNonWorkingTime: boolean;
  showWeekNumbers: boolean;
  fiscalYearStart: number;
}

export enum TimeUnit {
  MINUTES = 'minutes',
  HOURS = 'hours',
  DAYS = 'days',
  WEEKS = 'weeks',
  MONTHS = 'months',
  QUARTERS = 'quarters',
  YEARS = 'years'
}

export interface GanttConfiguration {
  showTaskNames: boolean;
  showResources: boolean;
  showDependencies: boolean;
  showProgress: boolean;
  showCriticalPath: boolean;
  showBaseline: boolean;
  barHeight: number;
  rowHeight: number;
  linkStyle: LinkStyle;
  colorScheme: GanttColorScheme;
}

export enum LinkStyle {
  STRAIGHT = 'straight',
  ANGLED = 'angled',
  CURVED = 'curved'
}

export interface GanttColorScheme {
  normalTask: string;
  criticalTask: string;
  milestoneTask: string;
  summaryTask: string;
  completedTask: string;
  baselineTask: string;
  dependencyLine: string;
  selectedTask: string;
}

export interface TableConfiguration {
  columns: ColumnDefinition[];
  showGridLines: boolean;
  showRowHeaders: boolean;
  showColumnHeaders: boolean;
  autoFitColumns: boolean;
  frozenColumns: number;
}

export interface ColumnDefinition {
  id: string;
  name: string;
  fieldType: FieldType;
  width: number;
  visible: boolean;
  editable: boolean;
  format?: string;
  alignment: Alignment;
  summaryType?: SummaryType;
}

export enum FieldType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
  DURATION = 'duration',
  COST = 'cost',
  PERCENTAGE = 'percentage',
  LIST = 'list',
  CUSTOM = 'custom'
}

export enum Alignment {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right'
}

export enum SummaryType {
  NONE = 'none',
  SUM = 'sum',
  AVERAGE = 'average',
  COUNT = 'count',
  MIN = 'min',
  MAX = 'max'
}

export interface Filter {
  id: ID;
  name: string;
  field: string;
  operator: FilterOperator;
  value: string | number | boolean | Date | null;
  enabled: boolean;
}

export enum FilterOperator {
  EQUALS = 'eq',
  NOT_EQUALS = 'ne',
  GREATER_THAN = 'gt',
  GREATER_OR_EQUAL = 'ge',
  LESS_THAN = 'lt',
  LESS_OR_EQUAL = 'le',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  IS_NULL = 'is_null',
  IS_NOT_NULL = 'is_not_null',
  IN = 'in',
  NOT_IN = 'not_in'
}

export interface GroupDefinition {
  field: string;
  direction: GroupDirection;
  showSummary: boolean;
}

export enum GroupDirection {
  ASCENDING = 'asc',
  DESCENDING = 'desc'
}

export interface SortDefinition {
  field: string;
  direction: SortDirection;
}

export enum SortDirection {
  ASCENDING = 'asc',
  DESCENDING = 'desc'
}

export interface ChartConfiguration {
  chartType: ChartType;
  xAxis: AxisConfiguration;
  yAxis: AxisConfiguration;
  series: SeriesDefinition[];
  legend: LegendConfiguration;
  colors: string[];
}

export enum ChartType {
  BAR = 'bar',
  LINE = 'line',
  PIE = 'pie',
  AREA = 'area',
  SCATTER = 'scatter'
}

export interface AxisConfiguration {
  title: string;
  min?: number;
  max?: number;
  format?: string;
  showGrid: boolean;
}

export interface SeriesDefinition {
  field: string;
  name: string;
  type: SeriesType;
  color: string;
}

export enum SeriesType {
  LINE = 'line',
  BAR = 'bar',
  AREA = 'area'
}

export interface LegendConfiguration {
  show: boolean;
  position: LegendPosition;
}

export enum LegendPosition {
  TOP = 'top',
  BOTTOM = 'bottom',
  LEFT = 'left',
  RIGHT = 'right'
}

// ============================================================================
// ДИАЛОГОВЫЕ ОКНА И UI ЭЛЕМЕНТЫ
// ============================================================================

export interface DialogConfig {
  title: string;
  type: DialogType;
  size: DialogSize;
  modal: boolean;
  resizable: boolean;
  buttons: DialogButton[];
  fields: FormField[];
  validation?: ValidationRule[];
}

export enum DialogType {
  CREATE = 'create',
  EDIT = 'edit',
  VIEW = 'view',
  DELETE = 'delete',
  IMPORT = 'import',
  EXPORT = 'export',
  SETTINGS = 'settings',
  ABOUT = 'about'
}

export enum DialogSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  FULLSCREEN = 'fullscreen'
}

export interface DialogButton {
  id: string;
  label: string;
  type: ButtonType;
  action: string;
  disabled?: boolean;
  visible?: boolean;
}

export enum ButtonType {
  OK = 'ok',
  CANCEL = 'cancel',
  APPLY = 'apply',
  HELP = 'help',
  YES = 'yes',
  NO = 'no',
  SAVE = 'save',
  DELETE = 'delete',
  IMPORT = 'import',
  EXPORT = 'export'
}

export interface FormField {
  id: string;
  name: string;
  type: FieldType;
  label: string;
  value: string | number | boolean | Date | null;
  required: boolean;
  editable: boolean;
  visible: boolean;
  options?: OptionItem[];
  validation?: FieldValidation[];
  helpText?: string;
}

export interface OptionItem {
  value: string | number | boolean | null;
  label: string;
  disabled?: boolean;
}

export interface ValidationRule {
  field: string;
  type: ValidationType;
  parameters?: JsonObject | number | string;
  message: string;
}

export enum ValidationType {
  REQUIRED = 'required',
  MIN_LENGTH = 'min_length',
  MAX_LENGTH = 'max_length',
  MIN_VALUE = 'min_value',
  MAX_VALUE = 'max_value',
  PATTERN = 'pattern',
  EMAIL = 'email',
  UNIQUE = 'unique',
  CUSTOM = 'custom'
}

export interface FieldValidation {
  type: ValidationType;
  parameters?: JsonObject | number | string;
  message: string;
}

// ============================================================================
// СОБЫТИЯ И ДЕЙСТВИЯ
// ============================================================================

export interface UIEvent {
  type: EventType;
  source: string;
  timestamp: Date;
  data?: JsonObject | string | number | boolean | null;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

export enum EventType {
  TASK_SELECTED = 'task_selected',
  TASK_MODIFIED = 'task_modified',
  TASK_CREATED = 'task_created',
  TASK_DELETED = 'task_deleted',
  TASK_UPDATED = 'task_updated',
  TASK_DRAGGED = 'task_dragged',
  TASK_RESIZED = 'task_resized',
  RESOURCE_SELECTED = 'resource_selected',
  RESOURCE_MODIFIED = 'resource_modified',
  RESOURCE_CREATED = 'resource_created',
  RESOURCE_UPDATED = 'resource_updated',
  RESOURCE_DELETED = 'resource_deleted',
  RESOURCE_ASSIGNED = 'resource_assigned',
  VIEW_CHANGED = 'view_changed',
  VIEW_REFRESHED = 'view_refreshed',
  VIEW_ZOOMED = 'view_zoomed',
  FILTER_APPLIED = 'filter_applied',
  SORT_APPLIED = 'sort_applied',
  GROUP_APPLIED = 'group_applied',
  ZOOM_CHANGED = 'zoom_changed',
  SELECTION_CHANGED = 'selection_changed',
  SAVE_REQUESTED = 'save_requested',
  PRINT_REQUESTED = 'print_requested',
  EXPORT_REQUESTED = 'export_requested',
  IMPORT_REQUESTED = 'import_requested',
  // MainWindow специфические события
  FILE_ACTION = 'file_action',
  EDIT_ACTION = 'edit_action',
  TASK_ACTION = 'task_action',
  RESOURCE_ACTION = 'resource_action',
  SEARCH_ACTION = 'search_action',
  MENU_ACTION = 'menu_action',
  TOOLBAR_ACTION = 'toolbar_action',
  CONTEXT_MENU = 'context_menu',
  KEYBOARD_SHORTCUT = 'keyboard_shortcut',
  ERROR_OCCURRED = 'error_occurred',
  JAVA_STARTED = 'java_started',
  JAVA_STOPPED = 'java_stopped',
  PROJECT_OPENED = 'project_opened',
  PROJECT_SAVED = 'project_saved',
  PROJECT_CREATED = 'project_created',
  PROJECT_MODIFIED = 'project_modified',
  PROJECT_VALIDATED = 'project_validated',
  APPLICATION_STARTUP = 'application_startup',
  APPLICATION_SHUTDOWN = 'application_shutdown',
  VALIDATION_STARTED = 'validation_started',
  VALIDATION_COMPLETED = 'validation_completed',
  VALIDATION_ERROR = 'validation_error',
  NOTIFICATION_INFO = 'notification_info',
  NOTIFICATION_SUCCESS = 'notification_success',
  NOTIFICATION_WARNING = 'notification_warning',
  NOTIFICATION_ERROR = 'notification_error'
}

export interface Action {
  id: string;
  name: string;
  description: string;
  category: ActionCategory;
  icon: string;
  hotkey?: Hotkey;
  enabled: boolean;
  visible: boolean;
  execute: () => void;
  canExecute: () => boolean;
}

export enum ActionCategory {
  FILE = 'file',
  EDIT = 'edit',
  VIEW = 'view',
  INSERT = 'insert',
  FORMAT = 'format',
  TOOLS = 'tools',
  HELP = 'help'
}

export interface Hotkey {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
}

// ============================================================================
// ПОЛЬЗОВАТЕЛЬСКИЕ НАСТРОЙКИ
// ============================================================================

export interface UserPreferences {
  general: GeneralPreferences;
  display: DisplayPreferences;
  editing: EditingPreferences;
  calculations: CalculationPreferences;
  security: SecurityPreferences;
  schedule: SchedulePreferences;
  calendar: CalendarPreferences;
}

export interface SchedulePreferences {
  schedulingRule: TaskType;
  effortDriven: boolean;
  durationEnteredIn: Duration['unit'];
  workUnit: Duration['unit'];
  newTasksStartToday: boolean;
  honorRequiredDates: boolean;
}

export interface CalendarPreferences {
  hoursPerDay: number;
  hoursPerWeek: number;
  daysPerMonth: number;
  /** Режим расчёта длительности: 'working' (рабочие часы) или 'calendar' (24ч/сутки) */
  durationCalculationMode?: 'working' | 'calendar';
}

export interface GeneralPreferences {
  userName: string;
  companyName: string;
  defaultView: ViewType;
  autoSave: boolean;
  autoSaveInterval: number; // в минутах
  defaultCalendar: ID;
  dateFormat: string;
  timeFormat: string;
  currency: string;
  language: string;
  defaultStandardRate: number;
  defaultOvertimeRate: number;
}

export interface DisplayPreferences {
  showTips: boolean;
  showWelcomeScreen: boolean;
  animationEnabled: boolean;
  highContrast: boolean;
  fontSize: number;
  fontFamily: string;
  theme: Theme;
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  HIGH_CONTRAST = 'high_contrast'
}

export interface EditingPreferences {
  autoCalculate: boolean;
  showDependencies: boolean;
  allowTaskDeletion: boolean;
  confirmDeletions: boolean;
  splitTasksEnabled: boolean;
}

export interface CalculationPreferences {
  criticalSlack: Duration;
  calculateMultipleCriticalPaths: boolean;
  tasksAreCriticalIfSlackIsLessThan: Duration;
  showEstimatedDurations: boolean;
  showActualWork: boolean;
  showBaselineWork: boolean;
}

export interface SecurityPreferences {
  passwordProtection: boolean;
  readOnlyRecommended: boolean;
  encryptDocument: boolean;
  allowMacros: boolean;
  trustCenter: TrustCenterSettings;
}

export interface TrustCenterSettings {
  enableAllMacros: boolean;
  disableAllMacros: boolean;
  trustVbaProjects: boolean;
  trustedLocations: string[];
}

// ============================================================================
// КОНФИГУРАЦИЯ ПРИЛОЖЕНИЯ
// ============================================================================

export interface AppConfig {
  application: ApplicationConfig;
  database: DatabaseConfig;
  export: ExportConfig;
  import: ImportConfig;
  integration: IntegrationConfig;
}

export interface ApplicationConfig {
  name: string;
  version: string;
  build: string;
  license: LicenseInfo;
  updates: UpdateConfig;
  logging: LoggingConfig;
}

export interface LicenseInfo {
  type: LicenseType;
  user: string;
  company: string;
  expires?: Date;
  features: string[];
}

export enum LicenseType {
  TRIAL = 'trial',
  FREE = 'free',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise'
}

export interface UpdateConfig {
  autoCheck: boolean;
  checkInterval: number; // в днях
  channel: UpdateChannel;
  lastCheck?: Date;
}

export enum UpdateChannel {
  STABLE = 'stable',
  BETA = 'beta',
  DEV = 'dev'
}

export interface LoggingConfig {
  level: LogLevel;
  fileEnabled: boolean;
  consoleEnabled: boolean;
  maxFileSize: number; // в байтах
  maxFiles: number;
}

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace'
}

export interface DatabaseConfig {
  type: DatabaseType;
  connectionString: string;
  timeout: number;
  poolSize: number;
  backupEnabled: boolean;
  backupInterval: number; // в часах
}

export enum DatabaseType {
  SQLITE = 'sqlite',
  POSTGRESQL = 'postgresql',
  MYSQL = 'mysql',
  MSSQL = 'mssql'
}

export interface ExportConfig {
  formats: ExportFormat[];
  defaultFormat: ExportFormat;
  includeHiddenFields: boolean;
  includeBaselines: boolean;
  dateLocale: string;
}

export enum ExportFormat {
  XML = 'xml',
  XER = 'xer',
  MPP = 'mpp',
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json'
}

export interface ImportConfig {
  formats: ImportFormat[];
  autoDetectFormat: boolean;
  createBackup: boolean;
  mergeStrategy: MergeStrategy;
  fieldMapping: FieldMapping[];
}

export enum ImportFormat {
  XML = 'xml',
  XER = 'xer',
  MPP = 'mpp',
  CSV = 'csv',
  JSON = 'json',
  EXCEL = 'excel'
}

export enum MergeStrategy {
  REPLACE = 'replace',
  MERGE = 'merge',
  APPEND = 'append',
  UPDATE = 'update'
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transform?: string; // JavaScript expression
}

export interface IntegrationConfig {
  microsoftProject: MicrosoftProjectConfig;
  jira: JiraConfig;
  trello: TrelloConfig;
  slack: SlackConfig;
  webhooks: WebhookConfig[];
}

export interface MicrosoftProjectConfig {
  enabled: boolean;
  version: string;
  importPath: string;
  exportPath: string;
  autoSync: boolean;
  syncInterval: number; // в минутах
}

export interface JiraConfig {
  enabled: boolean;
  url: string;
  username: string;
  apiToken: string;
  projectKey: string;
  syncInterval: number;
  fieldMappings: FieldMapping[];
}

export interface TrelloConfig {
  enabled: boolean;
  apiKey: string;
  apiSecret: string;
  boardId: string;
  syncInterval: number;
}

export interface SlackConfig {
  enabled: boolean;
  webhookUrl: string;
  channel: string;
  notifications: NotificationType[];
}

export enum NotificationType {
  TASK_ASSIGNED = 'task_assigned',
  TASK_COMPLETED = 'task_completed',
  PROJECT_COMPLETED = 'project_completed',
  DEADLINE_APPROACHING = 'deadline_approaching',
  OVERALLOCATED = 'overallocated'
}

export interface WebhookConfig {
  id: ID;
  name: string;
  url: string;
  method: HTTPMethod;
  headers: Record<string, string>;
  events: EventType[];
  enabled: boolean;
}

export enum HTTPMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH'
}

// ============================================================================
// ДОПОЛНИТЕЛЬНЫЕ ТИПЫ
// ============================================================================

export interface Milestone {
  id: ID;
  name: string;
  date: Date;
  completed: boolean;
  description?: string;
}

export interface CustomField {
  id: ID;
  name: string;
  type: FieldType;
  value: string | number | boolean | Date | null;
  formula?: string;
  lookupTable?: LookupTable;
}

export interface LookupTable {
  values: LookupValue[];
}

export interface LookupValue {
  value: string | number | boolean | null;
  label: string;
  description?: string;
}

export interface Report {
  id: ID;
  name: string;
  description: string;
  type: ReportType;
  dataSource: string;
  template: string;
  parameters: ReportParameter[];
  schedule?: ReportSchedule;
}

export enum ReportType {
  PROJECT_SUMMARY = 'project_summary',
  TASK_LIST = 'task_list',
  RESOURCE_USAGE = 'resource_usage',
  COST_REPORT = 'cost_report',
  PROGRESS_REPORT = 'progress_report',
  CUSTOM = 'custom'
}

export interface ReportParameter {
  name: string;
  type: FieldType;
  required: boolean;
  defaultValue?: string | number | boolean | Date | null;
  options?: OptionItem[];
}

export interface ReportSchedule {
  enabled: boolean;
  frequency: RecurrencePattern;
  recipients: string[];
  format: ExportFormat;
}

export interface Template {
  id: ID;
  name: string;
  description: string;
  category: TemplateCategory;
  content: JsonObject | string; // Зависит от типа шаблона
  preview?: string;
}

export enum TemplateCategory {
  PROJECT = 'project',
  TASK = 'task',
  RESOURCE = 'resource',
  REPORT = 'report',
  VIEW = 'view'
}

export interface AuditLog {
  id: ID;
  timestamp: Date;
  user: string;
  action: string;
  entityType: string;
  entityId: ID;
  oldValue?: string | number | boolean | null;
  newValue?: string | number | boolean | null;
  ipAddress?: string;
}

// ============================================================================
// API ИНТЕРФЕЙСЫ
// ============================================================================

export interface ProjectAPI {
  getProjects(): Promise<Project[]>;
  getProject(id: ID): Promise<Project>;
  createProject(project: Partial<Project>): Promise<Project>;
  updateProject(id: ID, project: Partial<Project>): Promise<Project>;
  deleteProject(id: ID): Promise<void>;
  exportProject(id: ID, format: ExportFormat): Promise<Blob>;
  importProject(file: File, format: ImportFormat): Promise<Project>;
}

export interface TaskAPI {
  getTasks(projectId: ID): Promise<Task[]>;
  getTask(id: ID): Promise<Task>;
  createTask(task: Partial<Task>): Promise<Task>;
  updateTask(id: ID, task: Partial<Task>): Promise<Task>;
  deleteTask(id: ID): Promise<void>;
  moveTask(taskId: ID, newParentId?: ID, position?: number): Promise<void>;
  linkTasks(predecessorId: ID, successorId: ID, type: DependencyType): Promise<Dependency>;
  unlinkTasks(predecessorId: ID, successorId: ID): Promise<void>;
}

export interface ResourceAPI {
  getResources(projectId: ID): Promise<Resource[]>;
  getResource(id: ID): Promise<Resource>;
  createResource(resource: Partial<Resource>): Promise<Resource>;
  updateResource(id: ID, resource: Partial<Resource>): Promise<Resource>;
  deleteResource(id: ID): Promise<void>;
  assignResource(taskId: ID, resourceId: ID, units: Percentage): Promise<Assignment>;
  unassignResource(taskId: ID, resourceId: ID): Promise<void>;
  updateAssignment(assignmentId: ID, assignment: Partial<Assignment>): Promise<Assignment>;
}

export interface ViewAPI {
  getViews(): Promise<View[]>;
  getView(id: ID): Promise<View>;
  createView(view: Partial<View>): Promise<View>;
  updateView(id: ID, view: Partial<View>): Promise<View>;
  deleteView(id: ID): Promise<void>;
  setActiveView(id: ID): Promise<void>;
}

export interface FileAPI {
  saveProject(request: JsonObject): Promise<JsonObject>;
  loadProject(request: JsonObject): Promise<JsonObject>;
  listFiles(directory?: string): Promise<string[]>;
  fileExists(filePath: string): Promise<boolean>;
  getVersion(): Promise<string>;
}

// ============================================================================
// STATE MANAGEMENT ТИПЫ
// ============================================================================

export interface AppState {
  project: ProjectState;
  ui: UIState;
  user: UserState;
  config: ConfigState;
}

export interface ProjectState {
  current: Project | null;
  loading: boolean;
  error: string | null;
  lastModified: Date | null;
  unsavedChanges: boolean;
}

export interface UIState {
  currentView: View | null;
  selectedTasks: ID[];
  selectedResources: ID[];
  filters: Filter[];
  groups: GroupDefinition[];
  sorts: SortDefinition[];
  timeScale: TimeScale;
  sidebarVisible: boolean;
  toolbarVisible: boolean;
  statusbarVisible: boolean;
  isPulseActive: boolean;
  isLoading: boolean;
  dialogs: DialogState[];
  notifications: AppNotification[];
}

export interface DialogState {
  id: string;
  type: DialogType;
  open: boolean;
  data?: JsonObject | null;
  result?: JsonObject | null;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  autoClose: boolean;
  duration?: number;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: string;
  primary?: boolean;
}

export interface UserState {
  preferences: UserPreferences;
  session: UserSession;
  permissions: Permission[];
}

export interface UserSession {
  id: string;
  username: string;
  loginTime: Date;
  expiresAt: Date;
  lastActivity: Date;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  granted: boolean;
}

export interface ConfigState {
  app: AppConfig;
  loaded: boolean;
  loading: boolean;
  error: string | null;
}

// ============================================================================
// REACT COMPONENT PROPS
// ============================================================================

export interface GanttChartProps {
  project: Project;
  tasks: Task[];
  dependencies: Dependency[];
  timeScale: TimeScale;
  configuration: GanttConfiguration;
  selectedTasks: ID[];
  onTaskSelect: (taskIds: ID[]) => void;
  onTaskUpdate: (task: Task) => void;
  onDependencyCreate: (dependency: Dependency) => void;
  onDependencyDelete: (dependencyId: ID) => void;
  onTimeScaleChange: (timeScale: TimeScale) => void;
}

export interface TaskTableProps {
  tasks: Task[];
  columns: ColumnDefinition[];
  selectedTasks: ID[];
  onTaskSelect: (taskIds: ID[]) => void;
  onTaskUpdate: (task: Task) => void;
  onTaskCreate: (task: Partial<Task>) => void;
  onTaskDelete: (taskId: ID) => void;
  onSortChange: (sorts: SortDefinition[]) => void;
  onFilterChange: (filters: Filter[]) => void;
}

export interface ResourceChartProps {
  resources: Resource[];
  assignments: Assignment[];
  timeScale: TimeScale;
  configuration: ChartConfiguration;
  selectedResources: ID[];
  onResourceSelect: (resourceIds: ID[]) => void;
  onResourceUpdate: (resource: Resource) => void;
}

export interface DialogProps<T = JsonObject> {
  open: boolean;
  config: DialogConfig;
  data?: T;
  onClose: () => void;
  onSubmit: (result: T) => void;
  onCancel: () => void;
}

// ============================================================================
// УТИЛИТЫ И ХЕЛПЕРЫ
// ============================================================================

export interface DateUtils {
  formatDate: (date: Date, format?: string) => string;
  parseDate: (dateString: string, format?: string) => Date;
  addDuration: (date: Date, duration: Duration) => Date;
  subtractDuration: (date: Date, duration: Duration) => Date;
  getWorkingDays: (startDate: Date, endDate: Date, calendar: Calendar) => number;
  isWorkingDay: (date: Date, calendar: Calendar) => boolean;
}

export interface DurationUtils {
  formatDuration: (duration: Duration) => string;
  parseDuration: (durationString: string) => Duration;
  convertUnits: (duration: Duration, toUnit: Duration['unit']) => Duration;
  compare: (a: Duration, b: Duration) => number;
  add: (a: Duration, b: Duration) => Duration;
  subtract: (a: Duration, b: Duration) => Duration;
}

export interface CurrencyUtils {
  formatCurrency: (amount: Currency, locale?: string) => string;
  parseCurrency: (currencyString: string) => Currency;
  convert: (amount: Currency, toCurrency: string) => Promise<Currency>;
}

export interface ValidationUtils {
  validateTask: (task: Task) => ValidationResult;
  validateResource: (resource: Resource) => ValidationResult;
  validateProject: (project: Project) => ValidationResult;
  validateAssignment: (assignment: Assignment) => ValidationResult;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

// ============================================================================
// МИГРАЦИОННЫЕ ТИПЫ
// ============================================================================

export interface MigrationPlan {
  id: ID;
  sourceVersion: string;
  targetVersion: string;
  steps: MigrationStep[];
  estimatedDuration: Duration;
  riskLevel: RiskLevel;
  prerequisites: string[];
  rollbackPlan: RollbackPlan;
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface MigrationStep {
  id: ID;
  name: string;
  description: string;
  type: StepType;
  order: number;
  dependencies: ID[];
  script?: string;
  validation?: ValidationScript;
  rollback?: RollbackScript;
  estimatedDuration: Duration;
}

export enum StepType {
  SCHEMA = 'schema',
  DATA = 'data',
  CONFIGURATION = 'configuration',
  VALIDATION = 'validation',
  CLEANUP = 'cleanup'
}

export interface ValidationScript {
  type: 'sql' | 'javascript' | 'custom';
  script: string;
  expectedResults: (string | number | boolean | null)[];
}

export interface RollbackScript {
  type: 'sql' | 'javascript' | 'custom';
  script: string;
}

export interface RollbackPlan {
  available: boolean;
  automatic: boolean;
  steps: ID[];
  timeout: Duration;
  notifications: string[];
}

export interface FeatureParityMatrix {
  featureId: string;
  featureName: string;
  category: string;
  javaImplementation: boolean;
  reactImplementation: boolean;
  status: ParityStatus;
  notes?: string;
  testCases: string[];
  lastVerified?: Date;
}

export enum ParityStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  TESTED = 'tested',
  DEPLOYED = 'deployed',
  ISSUE = 'issue'
}

// ============================================================================
// ZUSTAND STORE INTERFACES
// ============================================================================

export interface TaskState {
  currentTask: ID | null;
  selectedTasks: ID[];
  isLoading: boolean;
  error: string | null;
}

export interface ResourceState {
  currentResource: ID | null;
  selectedResources: ID[];
  isLoading: boolean;
  error: string | null;
}

export interface ExtendedAppState {
  projects: ProjectState;
  tasks: TaskState;
  resources: ResourceState;
  ui: UIState;
  preferences: UserPreferences;
}

export interface ValidationError {
  field: string;
  message: string;
}

export type ValidationErrors = Record<string, string[]>;

/**
 * Строго типизированные данные для JSON-совместимых структур (без any/unknown)
 * Добавлена поддержка Date для совместимости с бизнес-моделями
 */
export type StrictData =
  | Error
  | string
  | number
  | boolean
  | Date
  | null
  | undefined
  | { [key: string]: StrictData }
  | StrictData[];

export interface ResourceAllocation {
  resourceId: string;
  taskId: string;
  percentage: number;
  startDate: string;
  endDate: string;
}

export type TaskDependencies = Record<string, string[]>;
export type TaskResourceAssignments = Record<string, string[]>;

// ============================================================================
// ЭКСПОРТ ТИПОВ ДЛЯ ЛЕГКОГО ИМПОРТА
// ============================================================================

// Экспорт типов удален во избежание конфликтов с другими модулями
// Все типы доступны через прямой импорт из этого файла
