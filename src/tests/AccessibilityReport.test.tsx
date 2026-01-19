import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AccessibilityReport } from '../src/components/ui/AccessibilityReport';
import { AccessibilityService } from '../src/services/AccessibilityService';
import type { AccessibilityReport as AccessibilityReportType } from '../src/services/AccessibilityService';

describe('AccessibilityReport', () => {
  let mockService: AccessibilityService;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockService = {
      testAccessibility: vi.fn(),
      getInstance: () => mockService
    } as any;

    vi.spyOn(AccessibilityService, 'getInstance').mockReturnValue(mockService);
  });

  const mockReport: AccessibilityReportType = {
    violations: [
      {
        id: 'color-contrast',
        impact: 'serious',
        tags: ['wcag2aa'],
        description: 'Text has insufficient contrast',
        help: 'Increase text contrast',
        helpUrl: 'https://test.com/contrast',
        nodes: [
          {
            target: ['.low-contrast-text'],
            html: '<span class="low-contrast-text">Low contrast text</span>'
          }
        ],
        wcagLevel: 'AA'
      },
      {
        id: 'button-name',
        impact: 'critical',
        tags: ['wcag2a'],
        description: 'Button has no accessible name',
        help: 'Add aria-label or text content',
        helpUrl: 'https://test.com/button-name',
        nodes: [
          {
            target: ['.button-without-name'],
            html: '<button class="button-without-name"></button>'
          }
        ],
        wcagLevel: 'A'
      }
    ],
    passes: [
      {
        id: 'image-alt',
        description: 'Images have alt text',
        help: 'All good',
        helpUrl: 'https://test.com/image-alt'
      }
    ],
    incomplete: [],
    timestamp: new Date(),
    url: 'https://test.com',
    testContext: 'document',
    complianceLevel: 'AA',
    isCompliant: false,
    score: 75.5
  };

  describe('Рендеринг компонента', () => {
    it('не должен рендериться когда isVisible=false', () => {
      const { container } = render(
        <AccessibilityReport 
          isVisible={false} 
          onClose={() => {}} 
        />
      );
      
      expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
    });

    it('должен рендериться когда isVisible=true', () => {
      render(
        <AccessibilityReport 
          isVisible={true} 
          onClose={() => {}} 
        />
      );
      
      expect(screen.getByText('Отчет доступности WCAG 2.1 AA')).toBeInTheDocument();
    });

    it('должен показывать правильный уровень соответствия', () => {
      render(
        <AccessibilityReport 
          isVisible={true} 
          onClose={() => {}} 
          complianceLevel="AAA"
        />
      );
      
      expect(screen.getByText('Отчет доступности WCAG 2.1 AAA')).toBeInTheDocument();
    });
  });

  describe('Автоматический запуск теста', () => {
    it('должен автоматически запускать тест при autoRun=true', async () => {
      mockService.testAccessibility.mockResolvedValue(mockReport);
      
      render(
        <AccessibilityReport 
          isVisible={true} 
          onClose={() => {}} 
          autoRun={true}
        />
      );

      await waitFor(() => {
        expect(mockService.testAccessibility).toHaveBeenCalledWith({
          context: undefined,
          level: 'AA'
        });
      });
    });

    it('не должен запускать тест при autoRun=false', () => {
      render(
        <AccessibilityReport 
          isVisible={true} 
          onClose={() => {}} 
          autoRun={false}
        />
      );

      expect(mockService.testAccessibility).not.toHaveBeenCalled();
    });
  });

  describe('Отображение результатов', () => {
    beforeEach(async () => {
      mockService.testAccessibility.mockResolvedValue(mockReport);
      
      render(
        <AccessibilityReport 
          isVisible={true} 
          onClose={() => {}} 
          autoRun={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('75.5%')).toBeInTheDocument();
      });
    });

    it('должен отображать оценку доступности', () => {
      expect(screen.getByText('75.5%')).toBeInTheDocument();
      expect(screen.getByText('Оценка доступности')).toBeInTheDocument();
    });

    it('должен отображать статистику нарушений', () => {
      expect(screen.getByText('2')).toBeInTheDocument(); // Нарушений
      expect(screen.getByText('1')).toBeInTheDocument(); // Пройдено тестов
      expect(screen.getByText('Не соответствует')).toBeInTheDocument();
    });

    it('должен отображать список нарушений', () => {
      expect(screen.getByText('Нарушения (2)')).toBeInTheDocument();
      expect(screen.getByText('color-contrast')).toBeInTheDocument();
      expect(screen.getByText('button-name')).toBeInTheDocument();
    });

    it('должен показывать уровень важности нарушений', () => {
      expect(screen.getByText('serious')).toBeInTheDocument();
      expect(screen.getByText('critical')).toBeInTheDocument();
      expect(screen.getByText('WCAG AA')).toBeInTheDocument();
      expect(screen.getByText('WCAG A')).toBeInTheDocument();
    });

    it('должен отображать время последнего теста', () => {
      const formattedTime = mockReport.timestamp.toLocaleString('ru-RU');
      expect(screen.getByText(`Последний тест: ${formattedTime}`)).toBeInTheDocument();
    });
  });

  describe('Взаимодействие с нарушениями', () => {
    beforeEach(async () => {
      mockService.testAccessibility.mockResolvedValue(mockReport);
      
      render(
        <AccessibilityReport 
          isVisible={true} 
          onClose={() => {}} 
          autoRun={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('color-contrast')).toBeInTheDocument();
      });
    });

    it('должен разворачивать нарушение при клике', async () => {
      const violation = screen.getByText('color-contrast').closest('.border-gray-200');
      
      fireEvent.click(violation!);

      await waitFor(() => {
        expect(screen.getByText('Помощь:')).toBeInTheDocument();
        expect(screen.getByText('Increase text contrast')).toBeInTheDocument();
        expect(screen.getByText('Подробнее')).toBeInTheDocument();
      });
    });

    it('должен показывать затронутые элементы при развертывании', async () => {
      const violation = screen.getByText('color-contrast').closest('.border-gray-200');
      
      fireEvent.click(violation!);

      await waitFor(() => {
        expect(screen.getByText('Затронутые элементы (1):')).toBeInTheDocument();
        expect(screen.getByText('.low-contrast-text')).toBeInTheDocument();
        expect(screen.getByText('<span class="low-contrast-text">Low contrast text</span>')).toBeInTheDocument();
      });
    });

    it('должен сворачивать нарушение при повторном клике', async () => {
      const violation = screen.getByText('color-contrast').closest('.border-gray-200');
      
      fireEvent.click(violation!);

      await waitFor(() => {
        expect(screen.getByText('Помощь:')).toBeInTheDocument();
      });

      fireEvent.click(violation!);

      await waitFor(() => {
        expect(screen.queryByText('Помощь:')).not.toBeInTheDocument();
      });
    });
  });

  describe('Фильтрация нарушений', () => {
    beforeEach(async () => {
      mockService.testAccessibility.mockResolvedValue(mockReport);
      
      render(
        <AccessibilityReport 
          isVisible={true} 
          onClose={() => {}} 
          autoRun={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('color-contrast')).toBeInTheDocument();
      });
    });

    it('должен фильтровать по уровню важности "критические"', async () => {
      const filterSelect = screen.getByDisplayValue('Все нарушения');
      
      fireEvent.change(filterSelect, { target: { value: 'critical' } });

      await waitFor(() => {
        expect(screen.getByText('button-name')).toBeInTheDocument();
        expect(screen.queryByText('color-contrast')).not.toBeInTheDocument();
      });
    });

    it('должен фильтровать по уровню важности "серьезные"', async () => {
      const filterSelect = screen.getByDisplayValue('Все нарушения');
      
      fireEvent.change(filterSelect, { target: { value: 'serious' } });

      await waitFor(() => {
        expect(screen.getByText('color-contrast')).toBeInTheDocument();
        expect(screen.queryByText('button-name')).not.toBeInTheDocument();
      });
    });

    it('должен показывать все нарушения при фильтре "все"', async () => {
      const filterSelect = screen.getByDisplayValue('Все нарушения');
      
      fireEvent.change(filterSelect, { target: { value: 'critical' } });

      await waitFor(() => {
        expect(screen.queryByText('color-contrast')).not.toBeInTheDocument();
      });

      fireEvent.change(filterSelect, { target: { value: 'all' } });

      await waitFor(() => {
        expect(screen.getByText('color-contrast')).toBeInTheDocument();
        expect(screen.getByText('button-name')).toBeInTheDocument();
      });
    });
  });

  describe('Изменение уровня соответствия', () => {
    beforeEach(async () => {
      mockService.testAccessibility.mockResolvedValue(mockReport);
      
      render(
        <AccessibilityReport 
          isVisible={true} 
          onClose={() => {}} 
          complianceLevel="A"
          autoRun={true}
        />
      );

      await waitFor(() => {
        expect(mockService.testAccessibility).toHaveBeenCalledWith({
          context: undefined,
          level: 'A'
        });
      });
    });

    it('должен изменять уровень соответствия в select', () => {
      const levelSelect = screen.getByDisplayValue('A');
      expect(levelSelect).toBeInTheDocument();
    });

    it('должен обновлять заголовок при изменении уровня', async () => {
      const levelSelect = screen.getByDisplayValue('A');
      
      fireEvent.change(levelSelect, { target: { value: 'AAA' } });

      await waitFor(() => {
        expect(screen.getByText('Отчет доступности WCAG 2.1 AAA')).toBeInTheDocument();
      });
    });
  });

  describe('Состояние загрузки', () => {
    beforeEach(() => {
      mockService.testAccessibility.mockReturnValue(new Promise(() => {})); // Never resolves
    });

    it('должен показывать состояние загрузки', async () => {
      render(
        <AccessibilityReport 
          isVisible={true} 
          onClose={() => {}} 
          autoRun={true}
        />
      );

      expect(screen.getByText('Тестирование...')).toBeInTheDocument();
      expect(screen.getByText('Запустить тест')).toBeDisabled();
    });
  });

  describe('Обработка ошибок', () => {
    beforeEach(() => {
      mockService.testAccessibility.mockRejectedValue(new Error('Test error'));
    });

    it('должен отображать ошибку тестирования', async () => {
      render(
        <AccessibilityReport 
          isVisible={true} 
          onClose={() => {}} 
          autoRun={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Ошибка')).toBeInTheDocument();
        expect(screen.getByText('Test error')).toBeInTheDocument();
      });
    });
  });

  describe('Закрытие модального окна', () => {
    it('должен вызывать onClose при клике на крестик', () => {
      const onClose = vi.fn();
      
      render(
        <AccessibilityReport 
          isVisible={true} 
          onClose={onClose} 
        />
      );

      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('должен вызывать onClose при клике вне модального окна', () => {
      const onClose = vi.fn();
      
      render(
        <AccessibilityReport 
          isVisible={true} 
          onClose={onClose} 
        />
      );

      const backdrop = screen.getByText('Отчет доступности WCAG 2.1 AA').closest('.fixed');
      fireEvent.click(backdrop!);

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Состояние без нарушений', () => {
    const cleanReport: AccessibilityReportType = {
      violations: [],
      passes: [
        {
          id: 'pass-rule',
          description: 'All good',
          help: 'Help',
          helpUrl: 'https://test.com'
        }
      ],
      incomplete: [],
      timestamp: new Date(),
      url: 'https://test.com',
      testContext: 'document',
      complianceLevel: 'AA',
      isCompliant: true,
      score: 100
    };

    beforeEach(async () => {
      mockService.testAccessibility.mockResolvedValue(cleanReport);
      
      render(
        <AccessibilityReport 
          isVisible={true} 
          onClose={() => {}} 
          autoRun={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('100%')).toBeInTheDocument();
      });
    });

    it('должен показывать сообщение об отсутствии нарушений', () => {
      expect(screen.getByText('Нарушения не найдены')).toBeInTheDocument();
      expect(screen.getByText('Текущая страница соответствует стандартам доступности WCAG 2.1 AA')).toBeInTheDocument();
    });

    it('должен показывать состояние соответствия', () => {
      expect(screen.getByText('Соответствует')).toBeInTheDocument();
      expect(screen.getByText('WCAG AA')).toBeInTheDocument();
    });
  });

  describe('Ручной запуск теста', () => {
    beforeEach(() => {
      mockService.testAccessibility.mockResolvedValue(mockReport);
    });

    it('должен запускать тест при клике на кнопку', async () => {
      render(
        <AccessibilityReport 
          isVisible={true} 
          onClose={() => {}} 
        />
      );

      const runButton = screen.getByText('Запустить тест');
      fireEvent.click(runButton);

      expect(mockService.testAccessibility).toHaveBeenCalledWith({
        context: undefined,
        level: 'AA'
      });
    });
  });

  describe('Скачать отчет', () => {
    beforeEach(async () => {
      mockService.testAccessibility.mockResolvedValue(mockReport);
      
      render(
        <AccessibilityReport 
          isVisible={true} 
          onClose={() => {}} 
          autoRun={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('75.5%')).toBeInTheDocument();
      });
    });

    it('должен показывать кнопку скачивания отчета', () => {
      const downloadButton = screen.getByText('Скачать отчет');
      expect(downloadButton).toBeInTheDocument();
    });

    it('должен скачивать отчет при клике на кнопку', () => {
      const mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url');
      const mockRevokeObjectURL = vi.fn();
      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = mockRevokeObjectURL;

      const mockCreateElement = vi.spyOn(document, 'createElement').mockImplementation(() => {
        const anchor = document.createElement('a');
        const clickMock = vi.fn();
        Object.defineProperty(anchor, 'click', { value: clickMock });
        Object.defineProperty(anchor, 'href', { value: '', writable: true });
        Object.defineProperty(anchor, 'download', { value: '', writable: true });
        return anchor;
      });

      const downloadButton = screen.getByText('Скачать отчет');
      fireEvent.click(downloadButton);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockCreateElement).toHaveBeenCalledWith('a');

      vi.restoreAllMocks();
    });
  });
});

