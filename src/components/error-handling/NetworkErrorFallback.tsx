import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface NetworkErrorFallbackProps {
  error: Error;
  resetError: () => void;
  retry?: () => void;
}

/**
 * Fallback компонент для Network ошибок
 * Следует SOLID принципу Single Responsibility
 */
export const NetworkErrorFallback: React.FC<NetworkErrorFallbackProps> = ({
  error,
  resetError,
  retry
}) => {
  const { t } = useTranslation();
  const isNetworkError = error.message.includes('fetch') || 
                         error.message.includes('network') ||
                         error.message.includes('ECONNREFUSED');

  return (
    <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">🌐</span>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-yellow-900 mb-2">
            {isNetworkError ? t('errors.network_title') : t('errors.data_load_error')}
          </h3>
          
          <p className="text-yellow-700 mb-4">
            {isNetworkError 
              ? t('errors.network_desc')
              : t('errors.data_desc')
            }
          </p>
          
          <div className="space-y-2 mb-4">
            <p className="text-sm text-yellow-600 font-mono">
              {error.name}: {error.message}
            </p>
          </div>
          
          <div className="flex space-x-3">
            {retry && (
              <Button
                onClick={retry}
                variant="default"
                size="sm"
              >
                {t('errors.retry')}
              </Button>
            )}
            
            <Button
              onClick={resetError}
              variant="secondary"
              size="sm"
            >
              {t('errors.close')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

