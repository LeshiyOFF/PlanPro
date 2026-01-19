import React, { useState, useEffect, useCallback } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { AccessibilityService } from '../../services/AccessibilityService';
import type { AccessibilityViolation, AccessibilityLevel } from '../../services/AccessibilityService';

interface AccessibilityTesterProps {
  enabled?: boolean;
  autoRun?: boolean;
  showToggle?: boolean;
  level?: AccessibilityLevel;
  onViolationFound?: (violations: AccessibilityViolation[]) => void;
  className?: string;
}

export const AccessibilityTester: React.FC<AccessibilityTesterProps> = ({
  enabled = true,
  autoRun = false,
  showToggle = true,
  level = 'AA',
  onViolationFound,
  className = ''
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const [violations, setViolations] = useState<AccessibilityViolation[]>([]);
  const [lastTestTime, setLastTestTime] = useState<Date | null>(null);
  const [isVisible, setIsVisible] = useState(enabled);

  const accessibilityService = AccessibilityService.getInstance();

  const runAccessibilityTest = useCallback(async () => {
    if (!isVisible) return;
    
    setIsTesting(true);
    try {
      const report = await accessibilityService.testAccessibility({ level });
      setViolations(report.violations);
      setLastTestTime(new Date());
      
      if (onViolationFound && report.violations.length > 0) {
        onViolationFound(report.violations);
      }
      
      if (report.violations.length > 0) {
        console.warn('Accessibility violations found:', report.violations);
      }
    } catch (error) {
      console.error('Accessibility test failed:', error);
    } finally {
      setIsTesting(false);
    }
  }, [isVisible, level, onViolationFound]);

  useEffect(() => {
    if (autoRun && isVisible) {
      const timer = setTimeout(() => {
        runAccessibilityTest();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [autoRun, isVisible, runAccessibilityTest]);

  useEffect(() => {
    if (!isVisible) return;

    const observer = new MutationObserver(() => {
      if (autoRun) {
        const timer = setTimeout(() => {
          runAccessibilityTest();
        }, 500);
        return () => clearTimeout(timer);
      }
      return undefined;
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'aria-label', 'alt', 'title']
    });

    return () => observer.disconnect();
  }, [autoRun, isVisible, runAccessibilityTest]);

  if (!showToggle && !enabled) {
    return null;
  }

  const criticalViolations = violations.filter(v => v.impact === 'critical').length;
  const seriousViolations = violations.filter(v => v.impact === 'serious').length;

  return (
    <>
      {showToggle && (
        <div className={`fixed bottom-4 right-4 z-40 ${className}`}>
          <button
            onClick={() => setIsVisible(!isVisible)}
            className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-lg transition-all ${
              isVisible 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
            title={isVisible ? 'Скрыть тест доступности' : 'Показать тест доступности'}
          >
            {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="text-xs font-medium">
              {isVisible ? 'A11y' : 'A11y'}
            </span>
            {isVisible && (criticalViolations > 0 || seriousViolations > 0) && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {criticalViolations + seriousViolations}
              </span>
            )}
          </button>
        </div>
      )}

      {isVisible && (
        <div className="fixed top-4 left-4 z-40 w-80">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">
                Тест доступности WCAG {level}
              </h3>
              <button
                onClick={runAccessibilityTest}
                disabled={isTesting}
                className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isTesting ? 'Тест...' : 'Тест'}
              </button>
            </div>
            
            <div className="p-3">
              {isTesting ? (
                <div className="text-center text-sm text-gray-600">
                  Тестирование доступности...
                </div>
              ) : violations.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-red-600">
                    Найдено нарушений: {violations.length}
                  </div>
                  
                  {criticalViolations > 0 && (
                    <div className="text-xs bg-red-50 border border-red-200 rounded p-2">
                      <span className="font-medium text-red-800">
                        Критические: {criticalViolations}
                      </span>
                    </div>
                  )}
                  
                  {seriousViolations > 0 && (
                    <div className="text-xs bg-orange-50 border border-orange-200 rounded p-2">
                      <span className="font-medium text-orange-800">
                        Серьезные: {seriousViolations}
                      </span>
                    </div>
                  )}
                  
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {violations.slice(0, 3).map((violation, index) => (
                      <div key={index} className="text-xs p-2 bg-gray-50 border border-gray-200 rounded">
                        <div className="font-medium text-gray-900">{violation.id}</div>
                        <div className="text-gray-600 truncate">{violation.description}</div>
                      </div>
                    ))}
                    {violations.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        ... и еще {violations.length - 3} нарушений
                      </div>
                    )}
                  </div>
                </div>
              ) : lastTestTime ? (
                <div className="text-center text-sm text-green-600">
                  Нарушений не найдено ✓
                </div>
              ) : (
                <div className="text-center text-sm text-gray-600">
                  Нажмите "Тест" для проверки доступности
                </div>
              )}
              
              {lastTestTime && (
                <div className="mt-2 text-xs text-gray-500 text-center">
                  Последний тест: {lastTestTime.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccessibilityTester;
