import { useMemo } from 'react';
import { FileAPIClient } from '@/services/FileAPIClient';
import type { APIClientConfig } from '@/types';

/**
 * Hook to provide FileAPIClient instance.
 */
export const useFileAPI = (config?: APIClientConfig) => {
  return useMemo(() => new FileAPIClient(config), [config]);
};
