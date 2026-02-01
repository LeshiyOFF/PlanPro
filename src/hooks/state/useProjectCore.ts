import { useProjectCore as useCore, useProjectMetadata } from './useProjectLifecycle'

/**
 * Агрегированный хук для управления ядром проекта
 * Следует принципу Composition over Inheritance
 */
export const useProjectCore = () => {
  const core = useCore()
  const metadata = useProjectMetadata()

  return {
    ...core,
    ...metadata,
  }
}

