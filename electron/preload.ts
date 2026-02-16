import { contextBridge } from 'electron';
import { createElectronAPI } from './preload/ElectronApiFactory';
import { ElectronAPI } from './preload/ElectronApiTypes';

export { ElectronAPI };

// webUtils должен импортироваться через require в preload контексте
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { webUtils } = require('electron');

const electronAPI = createElectronAPI(webUtils);

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
