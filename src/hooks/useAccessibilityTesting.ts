import { useEffect, useRef, useState } from 'react';
import { AccessibilityService } from '../services/AccessibilityService';
import type { AccessibilityLevel } from '../services/AccessibilityService';

interface UseAccessibilityTestingOptions {
  enabled?: boolean;
  level?: AccessibilityLevel;
  debounceMs?: number;
  onViolationChange?: (violations: any[]) => void;
}

export const useAccessibilityTesting = ({
  enabled = true,
  level = 'AA',
  debounceMs = 500,
  onViolationChange
}: UseAccessibilityTestingOptions = {}) => {
  const [violations, setViolations] = useState<any[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [lastTestTime, setLastTestTime] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const elementRef = useRef<HTMLElement>();

  const accessibilityService = AccessibilityService.getInstance();

  const testElement = async (element: HTMLElement) => {
    if (!enabled) return;
    
    setIsTesting(true);
    try {
      const elementViolations = await accessibilityService.testElement(element, level);
      setViolations(elementViolations);
      setLastTestTime(new Date());
      
      if (onViolationChange) {
        onViolationChange(elementViolations);
      }
    } catch (error) {
      console.error('Element accessibility test failed:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const scheduleTest = (element: HTMLElement) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      testElement(element);
    }, debounceMs);
  };

  const ref = (element: HTMLElement | null) => {
    if (element && element !== elementRef.current) {
      elementRef.current = element;
      if (enabled) {
        scheduleTest(element);
      }
    }
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    const observer = new MutationObserver(() => {
      scheduleTest(element);
    });

    observer.observe(element, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-label', 'alt', 'title', 'role', 'tabindex']
    });

    return () => {
      observer.disconnect();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, debounceMs]);

  return {
    ref,
    violations,
    isTesting,
    lastTestTime,
    testElement: () => elementRef.current && testElement(elementRef.current),
    hasViolations: violations.length > 0,
    criticalViolations: violations.filter(v => v.impact === 'critical').length,
    seriousViolations: violations.filter(v => v.impact === 'serious').length
  };
};

export default useAccessibilityTesting;
