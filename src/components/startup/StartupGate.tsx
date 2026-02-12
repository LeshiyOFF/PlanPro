import React, { ReactNode } from 'react'
import { useAppStore } from '@/store/appStore'
import { FullScreenStartupScreen } from './FullScreenStartupScreen'

interface StartupGateProps {
  children: ReactNode;
}

/**
 * Гейт стартового экрана (Фаза 2 ROADMAP).
 * Показывает полноэкранный welcome при !startupScreenCompleted, иначе — основной layout.
 */
export const StartupGate: React.FC<StartupGateProps> = ({ children }) => {
  const startupScreenCompleted = useAppStore((s) => s.startupScreenCompleted)

  if (!startupScreenCompleted) {
    return <FullScreenStartupScreen />
  }

  return <>{children}</>
}
