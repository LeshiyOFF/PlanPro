import React from 'react';
import { useLastProjectLoader } from '@/hooks/useLastProjectLoader';

/**
 * Компонент для автоматической загрузки последнего проекта при старте.
 * Должен располагаться внутри ProjectProvider для доступа к API.
 * 
 * Не рендерит ничего - только выполняет логику загрузки.
 */
export const LastProjectLoader: React.FC = () => {
  // Хук выполняет загрузку при монтировании
  useLastProjectLoader();
  
  // Компонент невидим
  return null;
};

