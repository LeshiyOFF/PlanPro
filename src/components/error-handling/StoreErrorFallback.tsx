import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface StoreErrorFallbackProps {
  error: Error;
  resetError: () => void;
  errorInfo?: {
    componentStack: string;
  };
}

/**
 * Fallback компонент для ошибок Store
 * Следует SOLID принципу Open/Closed
 */
export const StoreErrorFallback: React.FC<StoreErrorFallbackProps> = ({
  error,
  resetError,
  errorInfo
}) => {
  const { t } = useTranslation();
  const handleReload = () => {
    // Сбрасываем Zustand store
    if (window.location) {
      window.location.reload();
    }
  };

  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">!</span>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-red-900 mb-2">
            {t('errors.store_title')}
          </h3>
          
          <p className="text-red-700 mb-4">
            {t('errors.store_desc')}
          </p>
          
          <div className="space-y-2">
            <p className="text-sm text-red-600 font-mono">
              {error.name}: {error.message}
            </p>
            
            {errorInfo?.componentStack && (
              <details className="text-xs">
                <summary className="cursor-pointer text-red-600 hover:text-red-800">
                  {t('errors.show_details')}
                </summary>
                <pre className="mt-2 p-2 bg-red-100 rounded overflow-auto max-h-32">
                  {errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
          
          <div className="flex space-x-3 mt-4">
            <Button
              onClick={resetError}
              variant="secondary"
              size="sm"
            >
              {t('errors.try_again')}
            </Button>
            
            <Button
              onClick={handleReload}
              variant="primary"
              size="sm"
            >
              {t('errors.reload')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
