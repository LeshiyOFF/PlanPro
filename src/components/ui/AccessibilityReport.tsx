import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, X, ExternalLink, RefreshCw, Download, Filter } from 'lucide-react';
import { AccessibilityService } from '../../services/AccessibilityService';
import type { AccessibilityReport as IAccessibilityReport, AccessibilityViolation, AccessibilityLevel } from '../../services/AccessibilityService';

interface AccessibilityReportProps {
  isVisible: boolean;
  onClose: () => void;
  autoRun?: boolean;
  testContext?: string | Element;
  complianceLevel?: AccessibilityLevel;
}

export const AccessibilityReport: React.FC<AccessibilityReportProps> = ({
  isVisible,
  onClose,
  autoRun = false,
  testContext,
  complianceLevel = 'AA'
}) => {
  const [report, setReport] = useState<IAccessibilityReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<AccessibilityLevel>(complianceLevel);
  const [expandedViolations, setExpandedViolations] = useState<Set<string>>(new Set());
  const [filterImpact, setFilterImpact] = useState<string>('all');

  const accessibilityService = AccessibilityService.getInstance();

  useEffect(() => {
    if (isVisible && autoRun) {
      runTest();
    }
  }, [isVisible, autoRun]);

  const runTest = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const testOptions = {
        context: testContext,
        level: selectedLevel
      };
      
      const result = await accessibilityService.testAccessibility(testOptions);
      setReport(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка при тестировании доступности');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleViolationExpansion = (violationId: string) => {
    const newExpanded = new Set(expandedViolations);
    if (newExpanded.has(violationId)) {
      newExpanded.delete(violationId);
    } else {
      newExpanded.add(violationId);
    }
    setExpandedViolations(newExpanded);
  };

  const downloadReport = () => {
    if (!report) return;
    
    const reportData = {
      timestamp: report.timestamp,
      url: report.url,
      testContext: report.testContext,
      complianceLevel: report.complianceLevel,
      isCompliant: report.isCompliant,
      score: report.score,
      violations: report.violations,
      passes: report.passes,
      incomplete: report.incomplete
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accessibility-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getImpactColor = (impact: string | null) => {
    switch (impact) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'serious': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'minor': return 'text-primary bg-primary/10 border-primary/20';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getImpactIcon = (impact: string | null) => {
    switch (impact) {
      case 'critical': return <AlertCircle className="w-4 h-4" />;
      case 'serious': return <AlertTriangle className="w-4 h-4" />;
      case 'moderate': return <AlertTriangle className="w-4 h-4" />;
      case 'minor': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredViolations = report?.violations.filter(violation => {
    if (filterImpact === 'all') return true;
    return violation.impact === filterImpact;
  }) || [];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">Отчет доступности WCAG 2.1 {selectedLevel}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex items-center gap-4 p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <label htmlFor="level-select" className="text-sm font-medium text-gray-700">
              Уровень:
            </label>
            <select
              id="level-select"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as AccessibilityLevel)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="A">A</option>
              <option value="AA">AA</option>
              <option value="AAA">AAA</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterImpact}
              onChange={(e) => setFilterImpact(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все нарушения</option>
              <option value="critical">Критические</option>
              <option value="serious">Серьезные</option>
              <option value="moderate">Умеренные</option>
              <option value="minor">Незначительные</option>
            </select>
          </div>

          <div className="flex-1" />

          <button
            onClick={runTest}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Тестирование...' : 'Запустить тест'}
          </button>

          {report && (
            <button
              onClick={downloadReport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Скачать отчет
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Ошибка</span>
              </div>
              <p className="mt-1 text-red-700">{error}</p>
            </div>
          )}

          {report && (
            <>
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(report.score)}`}>
                      {report.score}%
                    </div>
                    <div className="text-sm text-gray-600">Оценка доступности</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {report.violations.length}
                    </div>
                    <div className="text-sm text-gray-600">Нарушений</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {report.passes.length}
                    </div>
                    <div className="text-sm text-gray-600">Пройдено тестов</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {report.isCompliant ? (
                        <span className="text-green-600">Соответствует</span>
                      ) : (
                        <span className="text-red-600">Не соответствует</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">WCAG {selectedLevel}</div>
                  </div>
                </div>
              </div>

              {filteredViolations.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Нарушения ({filteredViolations.length})
                  </h3>
                  
                  {filteredViolations.map((violation) => (
                    <div
                      key={violation.id}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div
                        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleViolationExpansion(violation.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${getImpactColor(violation.impact)}`}>
                              {getImpactIcon(violation.impact)}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{violation.id}</h4>
                              <p className="text-sm text-gray-600">{violation.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(violation.impact)}`}>
                              {violation.impact || 'unknown'}
                            </span>
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                              WCAG {violation.wcagLevel}
                            </span>
                          </div>
                        </div>
                      </div>

                      {expandedViolations.has(violation.id) && (
                        <div className="p-4 bg-gray-50 border-t border-gray-200">
                          <div className="mb-4">
                            <h5 className="font-medium text-gray-900 mb-2">Помощь:</h5>
                            <p className="text-sm text-gray-700 mb-2">{violation.help}</p>
                            <a
                              href={violation.helpUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-primary hover:text-slate-900"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Подробнее
                            </a>
                          </div>

                          {violation.nodes.length > 0 && (
                            <div>
                              <h5 className="font-medium text-gray-900 mb-2">
                                Затронутые элементы ({violation.nodes.length}):
                              </h5>
                              <div className="space-y-2">
                                {violation.nodes.slice(0, 5).map((node, index) => (
                                  <div key={index} className="p-2 bg-white border border-gray-200 rounded text-sm">
                                    <div className="font-mono text-xs text-gray-600 mb-1">
                                      {node.target.join(', ')}
                                    </div>
                                    {node.html && (
                                      <div className="text-xs text-gray-700 truncate">
                                        {node.html}
                                      </div>
                                    )}
                                  </div>
                                ))}
                                {violation.nodes.length > 5 && (
                                  <div className="text-xs text-gray-500 text-center">
                                    ... и еще {violation.nodes.length - 5} элементов
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Нарушения не найдены
                  </h3>
                  <p className="text-gray-600">
                    {filterImpact === 'all' 
                      ? 'Текущая страница соответствует стандартам доступности WCAG 2.1' 
                      : `Нет нарушений с уровнем важности "${filterImpact}"`}
                  </p>
                </div>
              )}
            </>
          )}

          {!report && !isLoading && !error && (
            <div className="text-center py-8">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Тестирование доступности
              </h3>
              <p className="text-gray-600 mb-4">
                Нажмите "Запустить тест" для проверки соответствия WCAG 2.1 {selectedLevel}
              </p>
            </div>
          )}
        </div>

        {report && (
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                URL: {report.url} | Контекст: {report.testContext}
              </div>
              <div>
                Последний тест: {report.timestamp.toLocaleString('ru-RU')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessibilityReport;
