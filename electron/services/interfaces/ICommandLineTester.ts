/// <reference path="../../types/index.d.ts" />

import { JreInfo } from './CommonTypes';

/**
 * Интерфейс для тестирования командной строки Java
 */
export interface ICommandLineTester {
  testBasicJava(): Promise<void>;
  isJavaInPath?(): Promise<boolean>;
  getJavaFromPath?(): Promise<JreInfo | null>;
}