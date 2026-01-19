import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@/providers/NavigationProvider';
import { SafeTooltip } from '@/components/ui/Tooltip';
import { ViewType } from '@/types/ViewTypes';
import './SidebarNavigation.css';
import { 
  BarChart, 
  Network, 
  Table, 
  Users, 
  BarChart2, 
  PieChart, 
  Calendar, 
  FileText, 
  TrendingUp, 
  GitBranch,
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

/**
 * Sidebar Navigation компонент
 * Следует SOLID принципу Single Responsibility
 */
export const SidebarNavigation: React.FC = () => {
  const { t } = useTranslation();
  const { currentView, navigateToView } = useNavigation();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['system']));

  const navigationSections = [
    {
      id: 'project_view',
      title: t('navigation.project_view'),
      items: [
        { type: ViewType.GANTT, label: t('navigation.gantt'), icon: BarChart, description: t('navigation.gantt_desc') },
        { type: ViewType.NETWORK, label: t('navigation.network'), icon: Network, description: t('navigation.network_desc') },
        { type: ViewType.TRACKING_GANTT, label: t('navigation.tracking'), icon: TrendingUp, description: t('navigation.tracking_desc') },
        { type: ViewType.WBS, label: t('navigation.wbs'), icon: GitBranch, description: t('navigation.wbs_desc') },
      ]
    },
    {
      id: 'sheets',
      title: t('navigation.sheets'),
      items: [
        { type: ViewType.TASK_SHEET, label: t('navigation.task_sheet'), icon: Table, description: t('navigation.task_sheet_desc') },
        { type: ViewType.RESOURCE_SHEET, label: t('navigation.resource_sheet'), icon: Users, description: t('navigation.resource_sheet_desc') },
      ]
    },
    {
      id: 'analysis',
      title: t('navigation.analysis'),
      items: [
        { type: ViewType.TASK_USAGE, label: t('navigation.task_usage'), icon: BarChart2, description: t('navigation.task_usage_desc') },
        { type: ViewType.RESOURCE_USAGE, label: t('navigation.resource_usage'), icon: PieChart, description: t('navigation.resource_usage_desc') },
      ]
    },
    {
      id: 'reporting',
      title: t('navigation.reporting'),
      items: [
        { type: ViewType.CALENDAR, label: t('navigation.calendar'), icon: Calendar, description: t('navigation.calendar_desc') },
        { type: ViewType.REPORTS, label: t('navigation.reports'), icon: FileText, description: t('navigation.reports_desc') },
      ]
    },
    {
      id: 'system',
      title: t('navigation.system'),
      items: [
        { type: ViewType.SETTINGS, label: t('navigation.settings'), icon: Settings, description: t('navigation.settings_desc') },
      ]
    }
  ];

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleViewClick = (viewType: ViewType) => {
    console.log('Sidebar: clicked view:', viewType);
    navigateToView(viewType);
  };

  return (
    <aside className="sidebar-navigation bg-background border-r border-border/40 h-full flex flex-col">
      {/* Header */}
      <div className="sidebar-header border-b border-border">
        <h2 className="text-lg font-semibold">ПланПро</h2>
        <p className="text-sm text-muted-foreground">{t('welcome.subtitle')}</p>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav flex-1 overflow-y-auto">
        {navigationSections.map(section => {
          const isExpanded = expandedSections.has(section.id);
          const hasActiveView = section.items.some(item => item.type === currentView);

          return (
            <div key={section.id} className="navigation-section">
              <button
                className={`section-header flex items-center justify-between w-full section-header-custom transition-colors ${hasActiveView ? 'active' : 'text-muted-foreground'}`}
                onClick={() => toggleSection(section.id)}
              >
                <span className="section-title font-medium">{section.title}</span>
                {isExpanded ? 
                  <ChevronDown className="h-4 w-4" /> : 
                  <ChevronRight className="h-4 w-4" />
                }
              </button>

              {isExpanded && (
                <div className="section-items mt-1 space-y-1">
                  {section.items.map(item => {
                    const Icon = item.icon;
                    const isActive = item.type === currentView;

                    return (
                      <button
                        key={item.type}
                        className={`item-button flex items-center w-full item-button-custom ${isActive ? 'active' : ''}`}
                        onClick={() => handleViewClick(item.type)}
                      >
                        <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                        <div className="flex-1 text-left">
                          <div className="item-label font-medium">{item.label}</div>
                          <div className="item-description text-xs text-muted-foreground">
                            {item.description}
                          </div>
                        </div>
                        {isActive && <div className="active-indicator w-1 h-full bg-primary absolute right-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer border-t border-border">
        <div className="text-xs text-muted-foreground">
          <div>{t('navigation.current_view')}</div>
          <div className="font-medium">
            {navigationSections
              .flatMap(section => section.items)
              .find(item => item.type === currentView)?.label || t('navigation.none')}
          </div>
        </div>
      </div>
    </aside>
  );
};

