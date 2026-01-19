import React from 'react';
import { 
  useCurrentView, 
  useSidebarCollapsed, 
  useTheme, 
  useLanguage,
  useUIIsLoading,
  useNotification,
  useHasActiveNotification,
  useNotificationType,
  useNotificationMessage,
  useUIActions 
} from '../../hooks/useAppStore';

export const UIStateDisplay: React.FC = () => {
  const currentView = useCurrentView();
  const sidebarCollapsed = useSidebarCollapsed();
  const theme = useTheme();
  const language = useLanguage();
  const isLoading = useUIIsLoading();
  const notification = useNotification();
  const hasNotification = useHasActiveNotification();
  const notificationType = useNotificationType();
  const notificationMessage = useNotificationMessage();
  
  const { 
    setCurrentView, 
    setSidebarCollapsed, 
    setTheme, 
    setLanguage,
    setLoading,
    setNotification,
    clearNotification 
  } = useUIActions();

  const views = ['dashboard', 'projects', 'tasks', 'resources', 'reports', 'settings'];
  const themes = ['light', 'dark', 'auto'];
  const languages = ['en', 'ru', 'zh', 'es', 'fr'];

  const handleShowNotification = (type: 'success' | 'error' | 'warning' | 'info') => {
    const messages = {
      success: 'Operation completed successfully!',
      error: 'An error occurred while processing your request.',
      warning: 'Please review your input before proceeding.',
      info: 'Here is some useful information for you.'
    };
    
    setNotification({
      type,
      message: messages[type],
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">UI State</h2>
      
      {isLoading && (
        <div className="mb-4 p-3 bg-slate-100 text-slate-800 rounded">
          UI is loading...
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Current View:</label>
          <select 
            className="w-full p-2 border rounded"
            value={currentView}
            onChange={(e) => setCurrentView(e.target.value)}
          >
            {views.map((view) => (
              <option key={view} value={view}>
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Sidebar State:</label>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={sidebarCollapsed}
              onChange={(e) => setSidebarCollapsed(e.target.checked)}
              className="w-4 h-4"
            />
            <span>Sidebar Collapsed</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Theme:</label>
          <select 
            className="w-full p-2 border rounded"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            {themes.map((themeOption) => (
              <option key={themeOption} value={themeOption}>
                {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Language:</label>
          <select 
            className="w-full p-2 border rounded"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Loading State:</label>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isLoading}
              onChange={(e) => setLoading(e.target.checked)}
              className="w-4 h-4"
            />
            <span>Is Loading</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Notifications:</label>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleShowNotification('success')}
                className="px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600"
              >
                Success
              </button>
              <button
                onClick={() => handleShowNotification('error')}
                className="px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
              >
                Error
              </button>
              <button
                onClick={() => handleShowNotification('warning')}
                className="px-3 py-2 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
              >
                Warning
              </button>
              <button
                onClick={() => handleShowNotification('info')}
                className="px-3 py-2 bg-primary text-white text-sm rounded hover:opacity-90"
              >
                Info
              </button>
            </div>
            
            {hasNotification && notification && (
              <div className="p-3 bg-gray-50 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium capitalize">{notificationType}:</span>
                    <p className="text-sm mt-1">{notificationMessage}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={clearNotification}
                    className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium mb-2">Current State Summary:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>View: {currentView}</div>
            <div>Sidebar: {sidebarCollapsed ? 'Collapsed' : 'Expanded'}</div>
            <div>Theme: {theme}</div>
            <div>Language: {language}</div>
            <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
            <div>Notification: {hasNotification ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

