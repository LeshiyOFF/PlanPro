import { IpcChannels } from '../../types/IpcChannels';

/**
 * Валидатор IPC взаимодействий.
 * Обеспечивает безопасность, ограничивая доступ только к разрешенным каналам.
 * Соответствует принципу Single Responsibility.
 */
export class IpcValidator {
  /**
   * Список разрешенных каналов для отправки из Renderer в Main
   */
  private static readonly SEND_WHITELIST: string[] = [
    IpcChannels.OPEN_EXTERNAL
  ];

  /**
   * Список разрешенных каналов для вызова (Invoke) из Renderer в Main
   */
  private static readonly INVOKE_WHITELIST: string[] = [
    IpcChannels.JAVA_EXECUTE_COMMAND,
    IpcChannels.JAVA_API_REQUEST,
    IpcChannels.JAVA_STATUS,
    IpcChannels.JAVA_START,
    IpcChannels.JAVA_STOP,
    IpcChannels.JAVA_RESTART,
    IpcChannels.GET_APP_INFO,
    IpcChannels.SHOW_MESSAGE_BOX,
    IpcChannels.SHOW_OPEN_DIALOG,
    IpcChannels.SHOW_SAVE_DIALOG
  ];

  /**
   * Список разрешенных каналов для прослушивания в Renderer
   */
  private static readonly RECEIVE_WHITELIST: string[] = [
    IpcChannels.JAVA_PROCESS_STARTED,
    IpcChannels.JAVA_PROCESS_STOPPED,
    IpcChannels.JAVA_STATUS_CHANGE,
    IpcChannels.JAVA_PROCESS_ERROR,
    IpcChannels.JAVA_ERROR_DETAILS,
    'bootstrap-status-change'
  ];

  /**
   * Проверка возможности вызова канала
   */
  public static isInvokeAllowed(channel: string): boolean {
    return this.INVOKE_WHITELIST.includes(channel);
  }

  /**
   * Проверка возможности отправки в канал
   */
  public static isSendAllowed(channel: string): boolean {
    return this.SEND_WHITELIST.includes(channel);
  }

  /**
   * Проверка возможности прослушивания канала
   */
  public static isReceiveAllowed(channel: string): boolean {
    return this.RECEIVE_WHITELIST.includes(channel);
  }
}

