/// <reference path="../types/index.d.ts" />

import { ConfigService } from './ConfigService';
import { SystemJreDetector } from './SystemJreDetector';
import { EmbeddedJreService } from './EmbeddedJreService';
import { IJreManager, JreType, JreSearchResult, JreInfo } from './interfaces/CommonTypes';

/**
 * Основной сервис управления JRE (Java Runtime Environment)
 * Реализует интерфейс IJreManager согласно принципам Clean Architecture
 * Следует принципу Dependency Inversion из SOLID
 */
export class JreManager {
  private readonly systemJreDetector: SystemJreDetector;
  private readonly embeddedJreService: EmbeddedJreService;
  private readonly minJavaVersion: string = '11';
  private readonly maxJavaVersion: string = '21';
  
  constructor() {
    this.systemJreDetector = new SystemJreDetector();
    this.embeddedJreService = new EmbeddedJreService();
  }

  /**
   * Проверяет наличие JRE
   */
  async isJreAvailable(): Promise<boolean> {
    try {
      const javaPath = await this.getJavaExecutablePath();
      return javaPath !== null;
    } catch {
      return false;
    }
  }

  /**
   * Получает путь к исполняемому файлу Java
   */
  async getJavaExecutablePath(): Promise<string | null> {
    try {
      // Приоритет: embedded JRE -> системный PATH -> поиск в системе
      
      // 1. Проверяем embedded JRE
      const embeddedPath = await this.embeddedJreService.getEmbeddedJavaPath();
      if (embeddedPath && await this.validateJre(embeddedPath)) {
        return embeddedPath;
      }
      
      // 2. Проверяем PATH
      const isInPath = await this.systemJreDetector.isJavaInPath();
      if (isInPath) {
        const pathFromEnv = await this.systemJreDetector.getJavaFromPath();
        if (pathFromEnv && await this.validateJre(pathFromEnv.executablePath || pathFromEnv.path)) {
          return pathFromEnv.executablePath || pathFromEnv.path;
        }
      }
      
      // 3. Ищем в системе
      const systemInstallations = await this.systemJreDetector.findSystemJavaInstallations();
      for (const installation of systemInstallations) {
        if (installation.isValid && this.isJavaVersionCompatible(installation.version)) {
          return installation.executablePath;
        }
      }
      
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Получает версию Java
   */
  async getJavaVersion(javaPath?: string): Promise<string | null> {
    try {
      const pathToCheck = javaPath || await this.getJavaExecutablePath();
      
      if (!pathToCheck) {
        return null;
      }
      
      if (javaPath) {
        const jreInfo = await this.systemJreDetector.getJreInfo(pathToCheck);
        return jreInfo?.version || null;
      }
      
      // Проверяем embedded JRE
      const embeddedInfo = await this.embeddedJreService.getEmbeddedJreInfo();
      if (embeddedInfo) {
        return embeddedInfo.version;
      }
      
      // Проверяем системную Java
      const systemInfo = await this.systemJreDetector.getJreInfo(pathToCheck);
      return systemInfo?.version || null;
    } catch {
      return null;
    }
  }

  /**
   * Проверяет совместимость версии Java
   */
  isJavaVersionCompatible(version: string): boolean {
    try {
      const normalizedVersion = this.normalizeVersion(version);
      const normalizedMin = this.normalizeVersion(this.minJavaVersion);
      const normalizedMax = this.normalizeVersion(this.maxJavaVersion);
      
      return this.compareVersions(normalizedVersion, normalizedMin) >= 0 &&
             this.compareVersions(normalizedVersion, normalizedMax) <= 0;
    } catch {
      return false;
    }
  }

  /**
   * Получает информацию о JRE
   */
  async getJreInfo(): Promise<JreInfo | null> {
    try {
      const javaPath = await this.getJavaExecutablePath();
      
      if (!javaPath) {
        return null;
      }
      
      // Проверяем embedded JRE
      const embeddedInfo = await this.embeddedJreService.getEmbeddedJreInfo();
      if (embeddedInfo && embeddedInfo.executablePath === javaPath) {
        return embeddedInfo;
      }
      
      // Проверяем системную Java
      return await this.systemJreDetector.getJreInfo(javaPath);
    } catch {
      return null;
    }
  }

  /**
   * Валидирует JRE
   */
  async validateJre(javaPath?: string): Promise<boolean> {
    try {
      const pathToValidate = javaPath || await this.getJavaExecutablePath();
      
      if (!pathToValidate) {
        return false;
      }
      
      // Проверяем embedded JRE
      const embeddedPath = await this.embeddedJreService.getEmbeddedJavaPath();
      if (embeddedPath && embeddedPath === pathToValidate) {
        return await this.embeddedJreService.checkEmbeddedJreIntegrity();
      }
      
      // Проверяем системную Java
      return await this.systemJreDetector.validateJavaExecutable(pathToValidate);
    } catch {
      return false;
    }
  }

  /**
   * Получает тип JRE
   */
  async getJreType(): Promise<JreType> {
    try {
      // Проверяем embedded JRE
      const embeddedInfo = await this.embeddedJreService.getEmbeddedJreInfo();
      if (embeddedInfo && embeddedInfo.isValid) {
        return JreType.EMBEDDED;
      }
      
      // Проверяем системную Java
      const javaPath = await this.getJavaExecutablePath();
      if (javaPath) {
        return JreType.SYSTEM;
      }
      
      return JreType.NONE;
    } catch {
      return JreType.NONE;
    }
  }

  /**
   * Ищет все доступные JRE
   */
  async findAllJreInstallations(): Promise<JreSearchResult> {
    try {
      const jreList: JreInfo[] = [];
      let recommendedJre: JreInfo | null = null;
      
      // Добавляем embedded JRE
      const embeddedInfo = await this.embeddedJreService.getEmbeddedJreInfo();
      if (embeddedInfo) {
        jreList.push(embeddedInfo);
        
        // Embedded JRE всегда рекомендуемый если валидный
        if (embeddedInfo.isValid && this.isJavaVersionCompatible(embeddedInfo.version)) {
          recommendedJre = embeddedInfo;
        }
      }
      
      // Добавляем системные JRE
      const systemInstallations = await this.systemJreDetector.findSystemJavaInstallations();
      systemInstallations.forEach(installation => {
        if (installation.executablePath || installation.path) {
          jreList.push(installation);
        }
      });
      
      // Если рекомендуемый не выбран, выбираем лучшую системную версию
      if (!recommendedJre) {
        const validSystemJre = systemInstallations
          .filter(jre => jre.isValid && this.isJavaVersionCompatible(jre.version))
          .sort((a, b) => this.compareVersions(
            this.normalizeVersion(b.version), 
            this.normalizeVersion(a.version)
          ));
        
        if (validSystemJre.length > 0) {
          recommendedJre = validSystemJre[0] || null;
        }
      }
      
      return {
        systemJre: systemInstallations,
        embeddedJre: null,
        customJre: [],
        recommendedJre
      };
    } catch (error) {
      return {
        systemJre: [],
        embeddedJre: null,
        customJre: [],
        recommendedJre: null
      };
    }
  }

  /**
   * Получает рекомендации по установке Java
   */
  async getJavaInstallationRecommendations(): Promise<string[]> {
    const recommendations: string[] = [];
    
    try {
      const jreType = await this.getJreType();
      
      if (jreType === JreType.NONE) {
        recommendations.push('Java не найдена. Установите Java 17 или более позднюю версию.');
        recommendations.push('Рекомендуется использовать Oracle JDK 17 или OpenJDK 17.');
        
        if (process.platform === 'win32') {
          recommendations.push('Скачайте Java с https://www.oracle.com/java/technologies/downloads/');
        } else if (process.platform === 'darwin') {
          recommendations.push('Установите Java через Homebrew: brew install openjdk@17');
        } else {
          recommendations.push('Установите Java через менеджер пакетов вашего дистрибутива');
        }
      } else {
        const currentVersion = await this.getJavaVersion();
        if (currentVersion && !this.isJavaVersionCompatible(currentVersion)) {
          recommendations.push(`Текущая версия Java ${currentVersion} несовместима.`);
          recommendations.push(`Требуется Java версии от ${this.minJavaVersion} до ${this.maxJavaVersion}.`);
        }
      }
      
      const hasEmbedded = await this.embeddedJreService.isEmbeddedJreAvailable();
      if (!hasEmbedded && jreType === JreType.SYSTEM) {
        recommendations.push('Рекомендуется использовать встроенное JRE для портативности приложения.');
      }
      
    } catch {
      recommendations.push('Произошла ошибка при анализе Java установки.');
    }
    
    return recommendations;
  }

  /**
   * Нормализует версию для сравнения
   */
  private normalizeVersion(version: string): string {
    try {
      // Удаляем нечисловые символы и возвращаем строку
      const cleanVersion = version.replace(/[^\d.]/g, '');
      return cleanVersion;
    } catch {
      return '0';
    }
  }

  /**
   * Сравнивает версии
   */
  private compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split('.').map(part => parseInt(part, 10)).filter(part => !isNaN(part));
    const v2Parts = version2.split('.').map(part => parseInt(part, 10)).filter(part => !isNaN(part));
    const maxLength = Math.max(v1Parts.length, v2Parts.length);
    
    for (let i = 0; i < maxLength; i++) {
      const v1 = v1Parts[i] || 0;
      const v2 = v2Parts[i] || 0;
      
      if (v1 !== v2) {
        return v1 - v2;
      }
    }
    
    return 0;
  }
}