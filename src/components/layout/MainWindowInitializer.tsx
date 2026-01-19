import React from 'react';
import { logger } from '@/utils/logger';
import { useProject } from '@/providers/ProjectProvider';
import { useAppStore } from '@/store/appStore';
import { useNavigation } from '@/providers/NavigationProvider';

/**
 * Props для MainWindowInitializer
 */
interface MainWindowInitializerProps {
  children: React.ReactNode;
}

/**
 * Компонент для инициализации действий MainWindow
 * Следует SOLID принципам:
 * - Single Responsibility: Только инициализация действий
 * - Dependency Inversion: Использует существующие провайдеры
 */
export const MainWindowInitializer: React.FC<MainWindowInitializerProps> = ({ 
  children 
}) => {
  // Временно отключаем инициализацию старых действий
  // Новая система меню (IntegratedMenu) работает независимо
  // logger.info('Using new IntegratedMenu system - old action system temporarily disabled');
  
  // TODO: Интегрировать старые действия в новую систему меню
  // когда потребуется полная функциональность

  return <>{children}</>;
};

/**
 * Hook для получения регистра MainWindow действий
 */
export const useMainWindowRegistry = () => {
  const { projectProvider } = useProject();
  const { appStore } = useAppStore();
  const { navigationProvider } = useNavigation();

  const dependencies = MainWindowActionRegistryFactory.extractDependencies(
    projectProvider,
    appStore,
    navigationProvider
  );

  const { MainWindowActionRegistry } = require('@/services/actions/MainWindowActionRegistry');
  const registry = new MainWindowActionRegistry(dependencies);

  return registry;
};

