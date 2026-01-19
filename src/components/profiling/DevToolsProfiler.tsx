import React, { useState, useEffect } from 'react';
import { useProfiler } from '@/providers/ReactProfilerProvider';
import { type ComponentProfile, type ProfilerMetrics } from '@/services/ReactProfilerService';
import { type CollectedMetrics } from '@/services/PerformanceMetricsCollector';

/**
 * Интерфейс для состояния Profiler UI
 */
interface ProfilerUIState {
  isActive: boolean;
  showDetails: boolean;
  selectedMetric?: ProfilerMetrics;
  selectedComponent?: ComponentProfile;
}

/**
 * DevTools Profiler UI компонент
 * Следует SOLID принципу Single Responsibility
 */
export const DevToolsProfiler: React.FC = () => {
  const profiler = useProfiler();
  const [uiState, setUiState] = useState<ProfilerUIState>({
    isActive: false,
    showDetails: false,
  });

  const [metrics, setMetrics] = useState<ProfilerMetrics[]>([]);
  const [componentProfiles, setComponentProfiles] = useState<ComponentProfile[]>([]);
  const [performanceStats, setPerformanceStats] = useState<any>(null);

  // Обновление данных
  useEffect(() => {
    const updateData = () => {
      setMetrics(profiler.getMetrics());
      setComponentProfiles(profiler.getComponentProfiles());
      setPerformanceStats(profiler.getPerformanceStats());
    };

    updateData();
    const interval = setInterval(updateData, 1000);
    return () => clearInterval(interval);
  }, []); // Без зависимостей для предотвращения бесконечных рендеров

  const toggleProfiler = () => {
    const newState = !uiState.isActive;
    profiler.setEnabled(newState);
    setUiState(prev => ({ ...prev, isActive: newState }));
  };

  const clearMetrics = () => {
    profiler.reset();
    setMetrics([]);
    setComponentProfiles([]);
    setPerformanceStats(null);
  };

  if (!uiState.isActive && !process.env.NODE_ENV?.includes('development')) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-96">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Performance Profiler</h3>
        <div className="flex space-x-2">
          <button
            onClick={toggleProfiler}
            className={`px-3 py-1 rounded text-sm ${
              uiState.isActive
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {uiState.isActive ? 'Active' : 'Inactive'}
          </button>
          <button
            onClick={clearMetrics}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Clear
          </button>
        </div>
      </div>

      {uiState.isActive && (
        <>
          {/* Performance Stats */}
          {performanceStats && (
            <div className="mb-4 p-3 bg-primary/10 rounded">
              <h4 className="font-medium mb-2">Performance Stats</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Total Renders:</span> {performanceStats.totalRenders}
                </div>
                <div>
                  <span className="font-medium">Avg Render Time:</span> {performanceStats.averageRenderTime.toFixed(2)}ms
                </div>
                <div>
                  <span className="font-medium">Max Render Time:</span> {performanceStats.maxRenderTime.toFixed(2)}ms
                </div>
                <div>
                  <span className="font-medium">Slow Renders:</span> {performanceStats.slowRenderCount}
                </div>
              </div>
            </div>
          )}

          {/* Slow Components */}
          {componentProfiles.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Slow Components</h4>
              <div className="max-h-48 overflow-y-auto">
                {componentProfiles
                  .sort((a, b) => b.averageRenderTime - a.averageRenderTime)
                  .slice(0, 5)
                  .map((component, index) => (
                    <div
                      key={component.componentName}
                      className="p-2 bg-yellow-50 rounded mb-1 cursor-pointer hover:bg-yellow-100"
                      onClick={() => setUiState(prev => ({
                        ...prev,
                        selectedComponent: component,
                        showDetails: true,
                      }))}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">{component.componentName}</span>
                        <span className="text-sm text-gray-600">
                          {component.averageRenderTime.toFixed(2)}ms
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Renders: {component.renderCount} | Max: {component.maxRenderTime.toFixed(2)}ms
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Toggle Details */}
          <button
            onClick={() => setUiState(prev => ({ ...prev, showDetails: !prev.showDetails }))}
            className="w-full px-3 py-2 bg-gray-100 rounded text-sm hover:bg-gray-200"
          >
            {uiState.showDetails ? 'Hide' : 'Show'} Details
          </button>

          {/* Detailed Metrics */}
          {uiState.showDetails && (
            <div className="mt-4 space-y-3">
              <div>
                <h4 className="font-medium mb-2">Recent Renders</h4>
                <div className="max-h-32 overflow-y-auto">
                  {metrics.slice(-10).reverse().map((metric, index) => (
                    <div key={`${metric.id}-${index}`} className="p-2 bg-gray-50 rounded mb-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">{metric.id}</span>
                        <span className={`text-sm px-2 py-1 rounded ${
                          metric.actualDuration > 16
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {metric.actualDuration.toFixed(2)}ms
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Phase: {metric.phase} | Base: {metric.baseDuration.toFixed(2)}ms
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Component Details Modal */}
      {uiState.showDetails && uiState.selectedComponent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              {uiState.selectedComponent.componentName} Details
            </h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Total Renders:</span> {uiState.selectedComponent.renderCount}
              </div>
              <div>
                <span className="font-medium">Total Render Time:</span> {uiState.selectedComponent.totalRenderTime.toFixed(2)}ms
              </div>
              <div>
                <span className="font-medium">Average Render Time:</span> {uiState.selectedComponent.averageRenderTime.toFixed(2)}ms
              </div>
              <div>
                <span className="font-medium">Max Render Time:</span> {uiState.selectedComponent.maxRenderTime.toFixed(2)}ms
              </div>
              <div>
                <span className="font-medium">Last Render Time:</span> {uiState.selectedComponent.lastRenderTime.toFixed(2)}ms
              </div>
            </div>
            <button
              onClick={() => setUiState(prev => ({ ...prev, showDetails: false, selectedComponent: undefined }))}
              className="w-full mt-4 px-4 py-2 bg-primary text-white rounded hover:opacity-90"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

