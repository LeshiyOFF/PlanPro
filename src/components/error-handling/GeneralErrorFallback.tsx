import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

interface GeneralErrorFallbackProps {
  error: Error;
  resetError: () => void;
  title?: string;
  description?: string;
  showDetails?: boolean;
}

/**
 * Универсальный Fallback компонент для ошибок
 * Следует SOLID принципу Dependency Inversion
 */
export const GeneralErrorFallback: React.FC<GeneralErrorFallbackProps> = ({
  error,
  resetError,
  title,
  description,
  showDetails = true,
}) => {
  const { t } = useTranslation()

  const displayTitle = title || t('errors.general_title')
  const displayDescription = description || t('errors.general_desc')

  return (
    <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl">⚠️</span>
        </div>

        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {displayTitle}
        </h3>

        <p className="text-gray-600 mb-4 max-w-md mx-auto">
          {displayDescription}
        </p>

        <div className="flex justify-center space-x-3">
          <Button
            onClick={resetError}
            variant="secondary"
            size="sm"
          >
            {t('errors.back')}
          </Button>

          <Button
            onClick={() => window.location.reload()}
            variant="default"
            size="sm"
          >
            {t('errors.reload')}
          </Button>
        </div>

        {showDetails && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mx-auto inline-block">
              {t('errors.details')}
            </summary>
            <div className="mt-4 space-y-2">
              <div className="text-sm">
                <span className="font-medium">{t('errors.error_type')}:</span>{' '}
                <span className="text-gray-600">{error.name}</span>
              </div>

              <div className="text-sm">
                <span className="font-medium">{t('errors.message')}:</span>{' '}
                <span className="text-gray-600">{error.message}</span>
              </div>

              {error.stack && (
                <div className="text-sm">
                  <span className="font-medium">{t('errors.stack_trace')}:</span>
                  <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  )
}

