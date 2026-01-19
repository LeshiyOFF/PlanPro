/// <reference path="../../types/index.d.ts" />

import { JreInfo } from './CommonTypes';

/**
 * Интерфейс для управления JRE
 */
export interface IJreManager {
  detectJava(): Promise<JreInfo[]>;
  getJavaExecutablePath(): Promise<string>;
  getRecommendedJre(): Promise<JreInfo | null>;
  getJreInfo(javaPath: string): Promise<JreInfo>;
  validateJre(javaPath: string): Promise<boolean>;
  isJavaVersionCompatible(version: string): boolean;
  compareVersions(v1: string, v2: string): number;
  normalizeVersion(version: string): string;
  findBestJre(jreList: JreInfo[]): JreInfo | null;
}