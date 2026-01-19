import React from 'react';
import { NavigationProvider } from '@/providers/NavigationProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ErrorBoundary } from '@/components/error-handling';
import { ContextMenuExample } from '@/presentation/contextmenu';

/**
 * Страница демонстрации Context Menu системы
 */
export const ContextMenuDemoPage: React.FC = () => {
  return (
    <ErrorBoundary fallback={<div>Произошла ошибка при загрузке демонстрации</div>}>
      <ThemeProvider>
        <NavigationProvider>
          <ContextMenuExample />
        </NavigationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};
