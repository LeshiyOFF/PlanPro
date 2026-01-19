import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AccessibilityService } from '../src/services/AccessibilityService';
import type { AccessibilityLevel, AccessibilityViolation } from '../src/services/AccessibilityService';

describe('AccessibilityService', () => {
  let service: AccessibilityService;

  beforeEach(() => {
    service = AccessibilityService.getInstance();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getInstance', () => {
    it('должен возвращать singleton экземпляр', () => {
      const instance1 = AccessibilityService.getInstance();
      const instance2 = AccessibilityService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('testAccessibility', () => {
    beforeEach(() => {
      global.axe = {
        run: vi.fn()
      };
    });

    it('должен запускать тестирование с правильными параметрами', async () => {
      const mockResults = {
        violations: [
          {
            id: 'color-contrast',
            impact: 'serious',
            tags: ['wcag2aa', 'wcag21aa'],
            description: 'Test violation',
            help: 'Test help',
            helpUrl: 'https://test.com',
            nodes: []
          }
        ],
        passes: [],
        incomplete: []
      };

      (global.axe.run as any).mockResolvedValue(mockResults);

      const report = await service.testAccessibility({ level: 'AA' });

      expect(global.axe.run).toHaveBeenCalledWith(
        document,
        expect.objectContaining({
          runOnly: expect.objectContaining({
            type: 'tag',
            values: expect.arrayContaining(['wcag2aa', 'wcag21aa'])
          }),
          reporter: 'v2',
          resultTypes: ['violations', 'passes', 'incomplete']
        })
      );

      expect(report.violations).toHaveLength(1);
      expect(report.violations[0].id).toBe('color-contrast');
      expect(report.violations[0].wcagLevel).toBe('AA');
    });

    it('должен корректно обрабатывать ошибки', async () => {
      const errorMessage = 'Test error';
      (global.axe.run as any).mockRejectedValue(new Error(errorMessage));

      await expect(service.testAccessibility()).rejects.toThrow(`Accessibility test failed: ${errorMessage}`);
    });

    it('должен рассчитывать корректный score', async () => {
      const mockResults = {
        violations: [
          {
            id: 'critical-violation',
            impact: 'critical',
            tags: ['wcag2aa'],
            description: 'Critical violation',
            help: 'Help',
            helpUrl: 'https://test.com',
            nodes: []
          },
          {
            id: 'serious-violation',
            impact: 'serious',
            tags: ['wcag2aa'],
            description: 'Serious violation',
            help: 'Help',
            helpUrl: 'https://test.com',
            nodes: []
          }
        ],
        passes: [
          {
            id: 'pass-rule',
            description: 'Passed rule',
            help: 'Help',
            helpUrl: 'https://test.com'
          }
        ],
        incomplete: []
      };

      (global.axe.run as any).mockResolvedValue(mockResults);

      const report = await service.testAccessibility({ level: 'AA' });

      expect(report.score).toBeLessThan(100);
      expect(report.score).toBeGreaterThan(0);
    });
  });

  describe('testComponent', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div class="test-component" id="component1">
          <button>Test Button</button>
        </div>
        <div class="test-component" id="component2">
          <input type="text" placeholder="Test Input" />
        </div>
      `;

      global.axe = {
        run: vi.fn()
      };
    });

    it('должен тестировать компоненты по селектору', async () => {
      const mockResults = {
        violations: [
          {
            id: 'button-name',
            impact: 'serious',
            tags: ['wcag2a'],
            description: 'Button has no accessible name',
            help: 'Add aria-label or text content',
            helpUrl: 'https://test.com',
            nodes: [{ target: ['.test-component button'] }]
          }
        ],
        passes: [],
        incomplete: []
      };

      (global.axe.run as any).mockResolvedValue(mockResults);

      const report = await service.testComponent('TestComponent', '.test-component');

      expect(report.testContext).toBe('TestComponent (.test-component)');
      expect(report.violations).toHaveLength(1);
      expect(report.violations[0].id).toBe('button-name');
    });

    it('должен выбрасывать ошибку если компонент не найден', async () => {
      await expect(
        service.testComponent('NonExistent', '.non-existent')
      ).rejects.toThrow('Component "NonExistent" not found with selector ".non-existent"');
    });

    it('должен удалять дубликаты нарушений', async () => {
      const mockResults = {
        violations: [
          {
            id: 'duplicate-rule',
            impact: 'moderate',
            tags: ['wcag2aa'],
            description: 'Duplicate violation',
            help: 'Help',
            helpUrl: 'https://test.com',
            nodes: []
          }
        ],
        passes: [],
        incomplete: []
      };

      (global.axe.run as any).mockResolvedValue(mockResults);

      const report = await service.testComponent('TestComponent', '.test-component');

      expect(report.violations).toHaveLength(1);
    });
  });

  describe('testElement', () => {
    beforeEach(() => {
      document.body.innerHTML = '<button id="test-button">Test</button>';
      global.axe = {
        run: vi.fn()
      };
    });

    it('должен тестировать отдельный элемент', async () => {
      const button = document.getElementById('test-button')!;
      const mockResults = {
        violations: [
          {
            id: 'color-contrast',
            impact: 'moderate',
            tags: ['wcag2aa'],
            description: 'Low contrast',
            help: 'Increase contrast',
            helpUrl: 'https://test.com',
            nodes: []
          }
        ],
        passes: [],
        incomplete: []
      };

      (global.axe.run as any).mockResolvedValue(mockResults);

      const violations = await service.testElement(button, 'AA');

      expect(violations).toHaveLength(1);
      expect(violations[0].id).toBe('color-contrast');
    });
  });

  describe('generateComplianceReport', () => {
    beforeEach(() => {
      global.axe = {
        run: vi.fn()
      };
    });

    it('должен генерировать полный отчет о соответствии', async () => {
      const mockResults = {
        violations: [
          {
            id: 'critical-violation',
            impact: 'critical',
            tags: ['wcag2aa'],
            description: 'Critical issue',
            help: 'Fix critical issue',
            helpUrl: 'https://test.com',
            nodes: []
          },
          {
            id: 'serious-violation',
            impact: 'serious',
            tags: ['wcag2aa'],
            description: 'Serious issue',
            help: 'Fix serious issue',
            helpUrl: 'https://test.com',
            nodes: []
          }
        ],
        passes: [
          {
            id: 'pass-rule',
            description: 'Passed rule',
            help: 'Help',
            helpUrl: 'https://test.com'
          }
        ],
        incomplete: []
      };

      (global.axe.run as any).mockResolvedValue(mockResults);

      const { summary, report } = await service.generateComplianceReport('AA');

      expect(summary.totalViolations).toBe(2);
      expect(summary.criticalViolations).toBe(1);
      expect(summary.seriousViolations).toBe(1);
      expect(summary.moderateViolations).toBe(0);
      expect(summary.minorViolations).toBe(0);
      expect(summary.isCompliant).toBe(false);
      expect(summary.score).toBeLessThan(100);

      expect(report.violations).toHaveLength(2);
      expect(report.passes).toHaveLength(1);
      expect(report.complianceLevel).toBe('AA');
    });

    it('должен показывать полное соответствие при отсутствии нарушений', async () => {
      const mockResults = {
        violations: [],
        passes: [
          {
            id: 'pass-rule-1',
            description: 'Passed rule 1',
            help: 'Help 1',
            helpUrl: 'https://test1.com'
          },
          {
            id: 'pass-rule-2',
            description: 'Passed rule 2',
            help: 'Help 2',
            helpUrl: 'https://test2.com'
          }
        ],
        incomplete: []
      };

      (global.axe.run as any).mockResolvedValue(mockResults);

      const { summary, report } = await service.generateComplianceReport('AA');

      expect(summary.totalViolations).toBe(0);
      expect(summary.isCompliant).toBe(true);
      expect(summary.score).toBe(100);

      expect(report.violations).toHaveLength(0);
      expect(report.passes).toHaveLength(2);
    });
  });

  describe('getWCAGRules', () => {
    it('должен возвращать все WCAG правила', () => {
      const rules = service.getWCAGRules();

      expect(rules.length).toBeGreaterThan(0);
      expect(rules[0]).toHaveProperty('ruleId');
      expect(rules[0]).toHaveProperty('wcagLevel');
      expect(rules[0]).toHaveProperty('description');

      const colorContrastRule = rules.find(rule => rule.ruleId === 'color-contrast');
      expect(colorContrastRule).toBeDefined();
      expect(colorContrastRule?.wcagLevel).toBe('AA');
    });
  });

  describe('getWCAGRule', () => {
    it('должен возвращать конкретное правило по ID', () => {
      const rule = service.getWCAGRule('color-contrast');

      expect(rule).toBeDefined();
      expect(rule?.ruleId).toBe('color-contrast');
      expect(rule?.wcagLevel).toBe('AA');
      expect(rule?.description).toBe('Текст должен иметь достаточный контраст с фоном');
    });

    it('должен возвращать undefined для несуществующего правила', () => {
      const rule = service.getWCAGRule('non-existent-rule');
      expect(rule).toBeUndefined();
    });
  });

  describe('buildAxeOptions', () => {
    it('должен строить правильные опции для уровня A', () => {
      const options = (service as any).buildAxeOptions('A', {});

      expect(options.runOnly.values).toContain('wcag2a');
      expect(options.runOnly.values).toContain('wcag21a');
      expect(options.runOnly.values).toContain('best-practice');
    });

    it('должен строить правильные опции для уровня AA', () => {
      const options = (service as any).buildAxeOptions('AA', {});

      expect(options.runOnly.values).toContain('wcag2aa');
      expect(options.runOnly.values).toContain('wcag21aa');
      expect(options.runOnly.values).toContain('best-practice');
    });

    it('должен строить правильные опции для уровня AAA', () => {
      const options = (service as any).buildAxeOptions('AAA', {});

      expect(options.runOnly.values).toContain('wcag2aaa');
      expect(options.runOnly.values).toContain('wcag21aaa');
      expect(options.runOnly.values).toContain('best-practice');
    });
  });
});
