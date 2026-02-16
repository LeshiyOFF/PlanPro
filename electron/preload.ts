import { contextBridge, webUtils } from 'electron';
import { createElectronAPI } from './preload/ElectronApiFactory';
import { ElectronAPI } from './preload/ElectronApiTypes';

export { ElectronAPI };

const electronAPI = createElectronAPI(webUtils);

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
