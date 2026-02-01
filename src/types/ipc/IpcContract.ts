/**
 * Типизированный контракт IPC коммуникаций.
 * Определяет строгие типы для всех IPC вызовов и событий.
 */

import { IpcChannels } from './IpcChannels'
import {
  JavaProcessStartedEvent,
  JavaProcessStoppedEvent,
  JavaStatusChangeEvent,
  JavaProcessErrorEvent,
  JavaErrorDetailsEvent,
} from './JavaProcessEvents'
import {
  JavaApiResponse,
  JavaApiResponseBase,
  JavaStatusResponse,
  JavaCommandResponse,
  JavaCommandArgs,
  JavaEventSubscriptionResponse,
  AppInfo,
  BinaryFileSaveResponse,
  UserPreferences,
  PreferencesResponse,
  PreferencesFileResponse,
} from './JavaApiTypes'
import {
  MessageBoxOptions,
  MessageBoxResult,
  OpenDialogOptions,
  OpenDialogResult,
  SaveDialogOptions,
  SaveDialogResult,
} from './DialogTypes'

export type {
  MessageBoxOptions,
  MessageBoxResult,
  OpenDialogOptions,
  OpenDialogResult,
  SaveDialogOptions,
  SaveDialogResult,
}

/**
 * Карта типов IPC invoke вызовов
 */
export interface IpcInvokeMap {
  [IpcChannels.GET_APP_INFO]: {
    args: [];
    result: AppInfo;
  };
  [IpcChannels.JAVA_START]: {
    args: [];
    result: JavaApiResponseBase;
  };
  [IpcChannels.JAVA_STOP]: {
    args: [];
    result: JavaApiResponseBase;
  };
  [IpcChannels.JAVA_RESTART]: {
    args: [];
    result: JavaApiResponseBase;
  };
  [IpcChannels.JAVA_STATUS]: {
    args: [];
    result: JavaStatusResponse;
  };
  [IpcChannels.JAVA_EXECUTE_COMMAND]: {
    args: [{ command: string; args: JavaCommandArgs[] }];
    result: JavaCommandResponse;
  };
  [IpcChannels.JAVA_API_REQUEST]: {
    args: [{ command: string; args?: JavaCommandArgs }];
    result: JavaApiResponse;
  };
  [IpcChannels.JAVA_SUBSCRIBE_EVENTS]: {
    args: [];
    result: JavaEventSubscriptionResponse;
  };
  [IpcChannels.JAVA_UNSUBSCRIBE_EVENTS]: {
    args: [];
    result: JavaEventSubscriptionResponse;
  };
  [IpcChannels.SHOW_MESSAGE_BOX]: {
    args: [MessageBoxOptions];
    result: MessageBoxResult;
  };
  [IpcChannels.SHOW_OPEN_DIALOG]: {
    args: [OpenDialogOptions];
    result: OpenDialogResult;
  };
  [IpcChannels.SHOW_SAVE_DIALOG]: {
    args: [SaveDialogOptions];
    result: SaveDialogResult;
  };
  [IpcChannels.SAVE_BINARY_FILE]: {
    args: [{ path: string; data: ArrayBuffer | Uint8Array }];
    result: BinaryFileSaveResponse;
  };
  [IpcChannels.OPEN_EXTERNAL]: {
    args: [string];
    result: void;
  };
  [IpcChannels.PREFERENCES_LOAD]: {
    args: [];
    result: PreferencesResponse;
  };
  [IpcChannels.PREFERENCES_SAVE]: {
    args: [UserPreferences];
    result: PreferencesResponse;
  };
  [IpcChannels.PREFERENCES_EXPORT]: {
    args: [{ path: string; data: UserPreferences }];
    result: PreferencesFileResponse;
  };
  [IpcChannels.PREFERENCES_IMPORT]: {
    args: [string];
    result: PreferencesFileResponse;
  };
}

/**
 * Карта типов IPC событий
 */
export interface IpcEventMap {
  [IpcChannels.JAVA_PROCESS_STARTED]: JavaProcessStartedEvent;
  [IpcChannels.JAVA_PROCESS_STOPPED]: JavaProcessStoppedEvent;
  [IpcChannels.JAVA_STATUS_CHANGE]: JavaStatusChangeEvent;
  [IpcChannels.JAVA_PROCESS_ERROR]: JavaProcessErrorEvent;
  [IpcChannels.JAVA_ERROR_DETAILS]: JavaErrorDetailsEvent;
  [IpcChannels.BOOTSTRAP_STATUS_CHANGE]: string;
}

/**
 * Типизированная функция отписки от события
 */
export type UnsubscribeFunction = () => void;

/**
 * Типизированный callback для события
 */
export type EventCallback<T> = (data: T) => void;
