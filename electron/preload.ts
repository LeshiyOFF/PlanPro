import { contextBridge } from 'electron';
import { createElectronAPI } from './preload/ElectronApiFactory';
import { ElectronAPI } from './preload/ElectronApiTypes';

export { ElectronAPI };

const electronAPI = createElectronAPI();

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
