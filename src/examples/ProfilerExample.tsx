import React from 'react';
import { withProfiler } from '@/providers/ReactProfilerProvider';

/**
 * Пример компонента с профилированием
 * Демонстрация использования withProfiler HOC
 */
interface ExampleComponentProps {
  data: string[];
  onRender?: (componentName: string, renderTime: number) => void;
}

const ExampleComponent: React.FC<ExampleComponentProps> = ({ data }) => {
  return (
    <div className="p-4 bg-white rounded border">
      <h3 className="text-lg font-semibold mb-2">Профилированный компонент</h3>
      <ul className="space-y-1">
        {data.map((item, index) => (
          <li key={index} className="p-2 bg-gray-50 rounded">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * Компонент обернутый в withProfiler для демонстрации
 */
export const ProfiledExampleComponent = withProfiler(ExampleComponent, 'ExampleComponent');

/**
 * Хук для использования профилирования в кастомных компонентах
 */
export const useComponentProfiler = (componentName: string) => {
  const startTime = React.useRef<number>();

  const startProfile = React.useCallback(() => {
    startTime.current = performance.now();
  }, []);

  const endProfile = React.useCallback(() => {
    if (startTime.current) {
      const renderTime = performance.now() - startTime.current;
      console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
      
      // Отправка в Sentry если медленно
      if (renderTime > 16) {
        const { SentryService } = require('@/services/SentryService');
        const sentryService = SentryService.getInstance();
        
        sentryService.captureMessage(
          `Slow component render: ${componentName} (${renderTime.toFixed(2)}ms)`,
          'warning',
          {
            componentName,
            renderTime,
            threshold: '16ms'
          }
        );
      }
    }
  }, [componentName]);

  React.useEffect(() => {
    startProfile();
    return endProfile;
  });

  return { startProfile, endProfile };
};

