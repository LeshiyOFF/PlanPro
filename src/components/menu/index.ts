// Экспорты всех компонентов меню
export { RibbonMenu } from './RibbonMenu';
export { RibbonTab } from './RibbonTab';
export { RibbonGroup } from './RibbonGroup';
export { FileRibbonTab } from './FileRibbonTab';
export { TaskRibbonTab } from './TaskRibbonTab';
export { ResourceRibbonTab } from './ResourceRibbonTab';
export { ViewRibbonTab } from './ViewRibbonTab';
export { IntegratedMenu } from './IntegratedMenu';
export { ContextMenu } from './ContextMenu';

// Экспорты фабрик (старая реализация)
export { ContextMenuFactory } from './factories/ContextMenuFactory';
export { TaskResourceContextMenuFactory } from './factories/TaskResourceContextMenuFactory';
export { ProjectGanttContextMenuFactory } from './factories/ProjectGanttContextMenuFactory';
export { BaseContextMenuFactory } from './factories/BaseContextMenuFactory';

// Экспорты новой Context Menu системы
export { ContextMenuProvider, useContextMenu } from '../../presentation/contextmenu/providers/ContextMenuProvider';
export { ContextMenuComponent } from '../../presentation/contextmenu/components/ContextMenu';
export { ContextMenuItemComponent } from '../../presentation/contextmenu/components/ContextMenuItem';
export { ContextMenuExample } from '../../presentation/contextmenu/ContextMenuExample';

// Экспорт стилей
import './RibbonMenu.css';
