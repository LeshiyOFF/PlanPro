/**
 * Типы для хука useIpcService.
 */

import type { JavaApiResponseBase, JavaApiResponse, JavaStatusData, JavaCommandArgs, JavaCommandResponse } from '@/types/ipc';
import type { IIpcService } from '@/services/IIpcService';
import type { JsonObject } from '@/types/json-types';

/**
 * Состояние статуса Java процесса
 */
export interface JavaStatusState {
  running: boolean;
  status: string;
  pid?: number;
  port?: number;
}

/** Явный тип возврата useIpcService (включая getJavaStatus для StatusMonitor/useStatusMonitor) */
export interface UseIpcServiceReturn {
  javaStatus: JavaStatusState | null;
  isJavaEventsSubscribed: boolean;
  startJava: () => Promise<JavaApiResponseBase>;
  stopJava: () => Promise<JavaApiResponseBase>;
  restartJava: () => Promise<JavaApiResponseBase>;
  refreshJavaStatus: () => Promise<JavaApiResponse<JavaStatusData>>;
  getJavaStatus: () => Promise<JavaApiResponse<JavaStatusData>>;
  executeJavaCommand: (command: string, args?: JavaCommandArgs[]) => Promise<JavaCommandResponse>;
  executeJavaApiRequest: <T = JsonObject>(command: string, args?: JavaCommandArgs[]) => Promise<JavaApiResponse<T>>;
  subscribeToJavaEvents: () => Promise<JavaApiResponseBase>;
  unsubscribeFromJavaEvents: () => Promise<JavaApiResponseBase>;
  ipcService: IIpcService;
}
