import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './i18n/config' // Импорт конфигурации i18n
import App from './App'
import './index.css'
import { EnvironmentConfig } from './config/EnvironmentConfig'

/**
 * Инициализация порта API из параметров URL (передаются из Electron)
 */
const params = new URLSearchParams(window.location.search);
const apiPort = params.get('apiPort');
if (apiPort) {
  EnvironmentConfig.setApiPort(parseInt(apiPort, 10));
}

/**
 * Инициализация React приложения
 */
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </HashRouter>
  </React.StrictMode>,
)

