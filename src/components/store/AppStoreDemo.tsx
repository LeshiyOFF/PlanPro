import React from 'react';
import { AppStoreProvider } from '../../providers/AppStoreProvider';
import { ProjectStateDisplay } from './ProjectStateDisplay';
import { TaskStateDisplay } from './TaskStateDisplay';
import { ResourceStateDisplay } from './ResourceStateDisplay';
import { UIStateDisplay } from './UIStateDisplay';
import { useIsAnyLoading, useHasAnyErrors, useHasValidationErrors } from '../../hooks/useAppStore';

const StoreDemoContent: React.FC = () => {
  const isAnyLoading = useIsAnyLoading();
  const hasAnyErrors = useHasAnyErrors();
  const hasValidationErrors = useHasValidationErrors();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ProjectLibre Zustand Store Demo
          </h1>
          <p className="text-gray-600">
            Interactive demonstration of the application state management
          </p>
        </div>

        {/* Status Bar */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Global Status</h2>
            <div className="flex gap-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                isAnyLoading 
                  ? 'bg-slate-100 text-slate-900' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {isAnyLoading ? '⏳ Loading' : '✅ Idle'}
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                hasAnyErrors 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {hasAnyErrors ? '❌ Has Errors' : '✅ No Errors'}
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                hasValidationErrors 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {hasValidationErrors ? '⚠️ Validation Issues' : '✅ Valid'}
              </div>
            </div>
          </div>
        </div>

        {/* Store Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProjectStateDisplay />
          <TaskStateDisplay />
          <ResourceStateDisplay />
          <UIStateDisplay />
        </div>

        {/* Instructions */}
        <div className="mt-8 p-6 bg-primary/10 rounded-lg">
          <h3 className="text-lg font-semibold text-black mb-3">
            How to Use This Demo
          </h3>
          <ul className="space-y-2 text-slate-900">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Each section shows a different part of the application state</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Use the buttons and inputs to modify the state in real-time</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>All state changes are automatically synchronized across components</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Open browser dev tools to see Zustand state changes logged</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>The state persists across page reloads (if localStorage is enabled)</span>
            </li>
          </ul>
        </div>

        {/* Technical Info */}
        <div className="mt-6 p-6 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Technical Implementation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <h4 className="font-medium mb-2">State Management:</h4>
              <ul className="space-y-1">
                <li>• Zustand v4.4.1</li>
                <li>• TypeScript strict typing</li>
                <li>• DevTools integration</li>
                <li>• Middleware support</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Features:</h4>
              <ul className="space-y-1">
                <li>• Master Functionality Catalog integration</li>
                <li>• Validation error handling</li>
                <li>• Loading state management</li>
                <li>• Resource allocation tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AppStoreDemo: React.FC = () => {
  return (
    <AppStoreProvider>
      <StoreDemoContent />
    </AppStoreProvider>
  );
};
