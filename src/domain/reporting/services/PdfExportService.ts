import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { PdfStyleService } from './PdfStyleService';
import { getElectronAPI } from '@/utils/electronAPI';

/**
 * Сервис для экспорта отчётов в PDF формат.
 * Использует html2canvas для захвата DOM-элемента и jsPDF для генерации PDF.
 * 
 * Соответствует стандартам:
 * - ISO 216 (размеры A4)
 * - Типографским стандартам отступов (15mm минимум от края)
 * - Безопасной зоне принтера (5-10mm)
 * 
 * Clean Architecture: Infrastructure Service.
 * SOLID: Single Responsibility - только экспорт в PDF.
 */
export class PdfExportService {
  
  // === КОНСТАНТЫ РАЗМЕРОВ (ISO 216 A4) ===
  private static readonly A4_WIDTH_MM = 210;
  private static readonly A4_HEIGHT_MM = 297;
  
  // === КОНСТАНТЫ ОТСТУПОВ (Типографские стандарты) ===
  // Минимальный отступ от края для безопасной зоны принтера
  private static readonly MARGIN_MM = 15;
  
  // === РАСЧЁТНЫЕ ЗНАЧЕНИЯ ===
  // Печатная область с учётом полей
  private static readonly PRINTABLE_WIDTH_MM = 
    PdfExportService.A4_WIDTH_MM - (2 * PdfExportService.MARGIN_MM); // 180mm
  private static readonly PRINTABLE_HEIGHT_MM = 
    PdfExportService.A4_HEIGHT_MM - (2 * PdfExportService.MARGIN_MM); // 267mm
  
  // Опции PDF документа
  private static readonly PDF_OPTIONS = {
    orientation: 'portrait' as const,
    unit: 'mm' as const,
    format: 'a4' as const,
    compress: true
  };
  
  // Качество рендеринга (2x для Retina дисплеев)
  private static readonly CANVAS_SCALE = 2;
  
  private readonly styleService = new PdfStyleService();

  /**
   * Экспортирует DOM-элемент в PDF файл.
   * @param element DOM-элемент для экспорта (обычно .report-paper)
   * @param filename Имя файла (без расширения)
   * @returns Promise<Blob> с PDF данными
   */
  public async exportToPdf(element: HTMLElement, _filename: string): Promise<Blob> {
    const canvas = await this.captureElement(element);
    const pdf = this.createPdfFromCanvas(canvas);
    return pdf.output('blob');
  }

  /**
   * Экспортирует и сохраняет PDF через Electron API.
   * @param element DOM-элемент для экспорта
   * @param defaultFilename Имя файла по умолчанию
   */
  public async exportAndSave(element: HTMLElement, defaultFilename: string): Promise<boolean> {
    try {
      const api = getElectronAPI();
      if (!api?.showSaveDialog || !api?.saveBinaryFile) return false;

      const blob = await this.exportToPdf(element, defaultFilename);
      const arrayBuffer = await blob.arrayBuffer();

      const result = await api.showSaveDialog({
        title: 'Сохранить PDF',
        defaultPath: `${defaultFilename}.pdf`,
        filters: [{ name: 'PDF Documents', extensions: ['pdf'] }]
      });

      if (result.canceled || !result.filePath) {
        return false;
      }

      const saveResult = await api.saveBinaryFile(result.filePath, arrayBuffer);
      return saveResult.success;
    } catch (error) {
      console.error('[PdfExportService] Export failed:', error);
      throw error;
    }
  }

  /**
   * Захватывает DOM-элемент как canvas с правильной стилизацией.
   * 
   * Важные аспекты:
   * 1. Ждём загрузки шрифтов перед рендерингом
   * 2. Применяем inline стили для корректного захвата Tailwind
   * 3. Используем scale 2x для качественного изображения
   */
  private async captureElement(element: HTMLElement): Promise<HTMLCanvasElement> {
    // Ждём загрузки всех шрифтов для корректного рендеринга
    await document.fonts.ready;
    
    return html2canvas(element, {
      scale: PdfExportService.CANVAS_SCALE,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      // Захватываем полный размер элемента включая скрытые области
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      // Клонируем элемент и применяем inline стили
      onclone: (_doc, clonedElement) => {
        this.styleService.applyAllStyles(clonedElement);
      }
    });
  }

  /**
   * Создаёт PDF из canvas с правильным масштабированием и отступами.
   * 
   * Алгоритм:
   * 1. Рассчитываем масштаб для вписывания в печатную область
   * 2. Центрируем изображение с учётом полей
   * 3. Если контент больше одной страницы - разбиваем на страницы
   */
  private createPdfFromCanvas(canvas: HTMLCanvasElement): jsPDF {
    const pdf = new jsPDF(PdfExportService.PDF_OPTIONS);
    
    // Рассчитываем размеры изображения для вписывания в печатную область
    const canvasAspectRatio = canvas.height / canvas.width;
    
    // Изображение масштабируется по ширине печатной области
    const imgWidth = PdfExportService.PRINTABLE_WIDTH_MM;
    const imgHeight = imgWidth * canvasAspectRatio;
    
    const imgData = canvas.toDataURL('image/png', 1.0);
    
    // Проверяем, помещается ли контент на одну страницу
    if (imgHeight <= PdfExportService.PRINTABLE_HEIGHT_MM) {
      // Контент помещается на одну страницу
      // Вставляем с отступами от краёв
      pdf.addImage(
        imgData, 
        'PNG', 
        PdfExportService.MARGIN_MM,     // X - отступ слева
        PdfExportService.MARGIN_MM,     // Y - отступ сверху
        imgWidth, 
        imgHeight
      );
    } else {
      // Контент не помещается - используем многостраничный режим
      this.addMultiPageContent(pdf, imgData, imgWidth, imgHeight);
    }

    return pdf;
  }

  /**
   * Добавляет контент на несколько страниц при необходимости.
   * Использует правильную пагинацию с сохранением отступов.
   */
  private addMultiPageContent(
    pdf: jsPDF, 
    imgData: string, 
    imgWidth: number, 
    imgHeight: number
  ): void {
    const pageHeight = PdfExportService.PRINTABLE_HEIGHT_MM;
    let remainingHeight = imgHeight;
    let sourceY = 0; // Позиция в исходном изображении
    let pageNumber = 0;
    
    while (remainingHeight > 0) {
      if (pageNumber > 0) {
        pdf.addPage();
      }
      
      // Высота контента на текущей странице
      const contentHeight = Math.min(remainingHeight, pageHeight);
      
      // Рассчитываем смещение для правильного отображения части изображения
      // Используем отрицательное смещение Y для показа нужной части
      const yOffset = PdfExportService.MARGIN_MM - sourceY;
      
      pdf.addImage(
        imgData,
        'PNG',
        PdfExportService.MARGIN_MM,  // X - всегда с отступом слева
        yOffset,                      // Y - смещение для показа нужной части
        imgWidth,
        imgHeight
      );
      
      sourceY += contentHeight;
      remainingHeight -= contentHeight;
      pageNumber++;
    }
  }
}
