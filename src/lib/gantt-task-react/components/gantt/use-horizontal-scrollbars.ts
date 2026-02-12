import { useCallback, useRef, useState } from "react";
import type { RefObject, SyntheticEvent } from "react";

import { SCROLL_STEP } from "../../constants";

export const useHorizontalScrollbars = (): [
  RefObject<HTMLDivElement>,
  number,
  (nextScrollX: number) => void,
  (event: SyntheticEvent<HTMLDivElement>) => void,
  () => void,
  () => void
] => {
  const [scrollX, setScrollX] = useState(0);

  const ganttTaskRootRef = useRef<HTMLDivElement>(null);

  const isLockedRef = useRef(false);

  // GANTT-NAV-V4: Программный скролл с гарантированным reflow
  const setScrollXProgrammatically = useCallback((nextScrollX: number) => {
    const scrollEl = ganttTaskRootRef.current;
    
    if (!scrollEl) {
      return;
    }

    const targetX = Math.max(0, nextScrollX);
    
    isLockedRef.current = true;
    
    // Принудительный reflow для корректного расчёта scrollWidth
    void scrollEl.offsetWidth;
    
    // Применяем скролл
    scrollEl.scrollLeft = targetX;
    
    // Записываем фактическое значение (браузер может ограничить)
    setScrollX(scrollEl.scrollLeft);

    // Короткий лок для предотвращения конфликтов
    setTimeout(() => {
      isLockedRef.current = false;
    }, 50);
  }, []);

  const onVerticalScrollbarScrollX = useCallback(
    (event: SyntheticEvent<HTMLDivElement>) => {
      if (isLockedRef.current) {
        return;
      }

      const nextScrollX = event.currentTarget.scrollLeft;

      if (ganttTaskRootRef.current) {
        ganttTaskRootRef.current.scrollLeft = nextScrollX;
      }

      setScrollX(nextScrollX);
    },
    []
  );

  const scrollToLeftStep = useCallback(() => {
    setScrollXProgrammatically(scrollX - SCROLL_STEP);
  }, [setScrollXProgrammatically, scrollX]);

  const scrollToRightStep = useCallback(() => {
    setScrollXProgrammatically(scrollX + SCROLL_STEP);
  }, [setScrollXProgrammatically, scrollX]);

  return [
    ganttTaskRootRef,
    scrollX,
    setScrollXProgrammatically,
    onVerticalScrollbarScrollX,
    scrollToLeftStep,
    scrollToRightStep,
  ];
};
