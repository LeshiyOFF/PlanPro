/**
 * Типизированный контракт FileAPI для операций с файлами проектов.
 * Соответствует ROADMAP: интерфейс приведён к типизированным контрактам.
 */

import type { FileSaveRequest, FileLoadRequest } from './request-types'
import type { FileSaveResponse, FileLoadResponse, FileListResponse } from './response-types'

export interface FileAPI {
  saveProject(request: FileSaveRequest): Promise<FileSaveResponse>;
  loadProject(request: FileLoadRequest): Promise<FileLoadResponse>;
  listFiles(directory?: string): Promise<FileListResponse>;
  fileExists(filePath: string): Promise<boolean>;
  getVersion(): Promise<string>;
}
