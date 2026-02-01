/**
 * Централизованный список IPC каналов приложения.
 * Единый источник истины для всех IPC коммуникаций.
 */
export enum IpcChannels {
  // Java Bridge - Команды (Main <- Renderer)
  JAVA_EXECUTE_COMMAND = 'java-execute-command',
  JAVA_START = 'java-start',
  JAVA_STOP = 'java-stop',
  JAVA_RESTART = 'java-restart',
  JAVA_STATUS = 'java-status',
  JAVA_API_REQUEST = 'java-api-request',
  JAVA_SUBSCRIBE_EVENTS = 'java-subscribe-events',
  JAVA_UNSUBSCRIBE_EVENTS = 'java-unsubscribe-events',

  // Java Bridge - События (Main -> Renderer)
  JAVA_PROCESS_STARTED = 'java-process-started',
  JAVA_PROCESS_STOPPED = 'java-process-stopped',
  JAVA_STATUS_CHANGE = 'java-status-change',
  JAVA_PROCESS_ERROR = 'java-process-error',
  JAVA_ERROR_DETAILS = 'java-error-details',

  // Системные - Команды (Main <- Renderer)
  GET_APP_INFO = 'get-app-info',
  SHOW_MESSAGE_BOX = 'show-message-box',
  SHOW_OPEN_DIALOG = 'show-open-dialog',
  SHOW_SAVE_DIALOG = 'show-save-dialog',
  SAVE_BINARY_FILE = 'save-binary-file',
  OPEN_EXTERNAL = 'open-external',

  // Пользовательские настройки
  PREFERENCES_LOAD = 'preferences:load',
  PREFERENCES_SAVE = 'preferences:save',
  PREFERENCES_EXPORT = 'preferences:export-to-file',
  PREFERENCES_IMPORT = 'preferences:import-from-file',

  // Bootstrap события
  BOOTSTRAP_STATUS_CHANGE = 'bootstrap-status-change'
}
