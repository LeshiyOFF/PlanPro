/**
 * Master Functionality Catalog - полная интеграция с TypeScript
 * Экспортирует все интерфейсы и типы из каталога функциональности
 */

// Реэкспорт всех типов из Master Functionality Catalog
export {
  // Базовые типы данных
  ID,
  DateRange,
  Duration,
  Percentage,
  Currency,
  
  // Проект
  Project,
  ProjectStatus,
  ProjectPriority,
  ProjectProperties,
  ProjectStatistics,
  ProjectConstraint,
  ConstraintType,
  
  // Задачи
  Task,
  TaskType,
  TaskStatus,
  TaskDates,
  TaskCost,
  TaskConstraint,
  
  // Зависимости
  Dependency,
  DependencyType,
  
  // Ресурсы
  Resource,
  ResourceType,
  ResourceCost,
  CostAccrualType,
  ResourceAvailability,
  AvailabilityException,
  ResourceProperties,
  
  // Назначения ресурсов
  Assignment,
  AssignmentCost,
  AssignmentDates,
  
  // Календари
  Calendar,
  CalendarType,
  WorkingTime,
  DayOfWeek,
  WorkPeriod,
  CalendarException,
  RecurrencePattern,
  RecurrenceFrequency,
  
  // View и отображение
  View,
  ViewType,
  ViewConfiguration,
  TimeScale,
  TimeUnit,
  GanttConfiguration,
  LinkStyle,
  GanttColorScheme,
  TableConfiguration,
  ColumnDefinition,
  FieldType,
  Alignment,
  SummaryType,
  Filter,
  FilterOperator,
  GroupDefinition,
  GroupDirection,
  SortDefinition,
  SortDirection,
  ChartConfiguration,
  ChartType,
  AxisConfiguration,
  SeriesDefinition,
  SeriesType,
  LegendConfiguration,
  LegendPosition,
  
  // Диалоговые окна и UI элементы
  DialogConfig,
  DialogType,
  DialogSize,
  DialogButton,
  ButtonType,
  FormField,
  OptionItem,
  ValidationRule,
  ValidationType,
  FieldValidation,
  
  // События и действия
  UIEvent,
  EventType,
  Action,
  ActionCategory,
  Hotkey,
  
  // Пользовательские настройки
  UserPreferences,
  GeneralPreferences,
  DisplayPreferences,
  Theme,
  EditingPreferences,
  CalculationPreferences,
  SecurityPreferences,
  TrustCenterSettings,
  
  // Конфигурация приложения
  AppConfig,
  ApplicationConfig,
  LicenseInfo,
  LicenseType,
  UpdateConfig,
  UpdateChannel,
  LoggingConfig,
  LogLevel,
  DatabaseConfig,
  DatabaseType,
  ExportConfig,
  ExportFormat,
  ImportConfig,
  ImportFormat,
  MergeStrategy,
  FieldMapping,
  IntegrationConfig,
  MicrosoftProjectConfig,
  JiraConfig,
  TrelloConfig,
  SlackConfig,
  NotificationType,
  WebhookConfig,
  HTTPMethod,
  
  // Дополнительные типы
  Milestone,
  CustomField,
  LookupTable,
  LookupValue,
  Report,
  ReportType,
  ReportParameter,
  ReportSchedule,
  Template,
  TemplateCategory,
  AuditLog,
  
  // API интерфейсы
  ProjectAPI,
  TaskAPI,
  ResourceAPI,
  ViewAPI,
  FileAPI,
  
  // State Management типы
  AppState,
  ProjectState,
  UIState,
  DialogState,
  Notification,
  NotificationAction,
  UserState,
  UserSession,
  Permission,
  ConfigState,
  
  // React Component Props
  GanttChartProps,
  TaskTableProps,
  ResourceChartProps,
  DialogProps,
  
  // Утилиты и хелперы
  DateUtils,
  DurationUtils,
  CurrencyUtils,
  ValidationUtils,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  
  // Миграционные типы
  MigrationPlan,
  RiskLevel,
  MigrationStep,
  StepType,
  ValidationScript,
  RollbackScript,
  RollbackPlan,
  FeatureParityMatrix,
  ParityStatus
} from './Master_Functionality_Catalog';

// Реэкспорт основных типов для удобства использования
export type {
  Project, Task, Resource, Assignment, Dependency, Calendar,
  View, GanttConfiguration, TableConfiguration, ColumnDefinition,
  DialogConfig, FormField, ValidationRule,
  UIEvent, Action, Hotkey,
  AppConfig, UserPreferences, ProjectAPI, TaskAPI, ResourceAPI,
  GanttChartProps, TaskTableProps, ResourceChartProps, DialogProps,
  DateUtils, DurationUtils, CurrencyUtils, ValidationUtils,
  MigrationPlan, FeatureParityMatrix
};

