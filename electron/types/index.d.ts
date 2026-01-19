// Типы для Node.js модулей
declare module 'child_process' {
  export function spawn(command: string, args?: string[], options?: any): any;
  export function execFile(command: string, args?: string[], callback?: (error: any, stdout?: any, stderr?: any) => void): any;
  export interface ChildProcess {
    pid?: number;
    stdout?: any;
    stderr?: any;
    on(event: string, listener: (...args: any[]) => void): void;
    kill(signal?: string): void;
  }
}

declare module 'fs' {
  export function existsSync(path: string): boolean;
  export function statSync(path: string): any;
  export function access(path: string, mode: number, callback: (err: any) => void): void;
  export function accessSync(path: string, mode?: number): void;
  export function readFileSync(path: string, encoding?: string): string;
  export function writeFileSync(path: string, data: string): void;
  export function readdirSync(path: string): string[];
  export function mkdirSync(path: string, options?: any): void;
  export const constants: any;
}

declare module 'path' {
  export function join(...paths: string[]): string;
  export function resolve(...paths: string[]): string;
  export function dirname(path: string): string;
  export function basename(path: string): string;
  export function extname(path: string): string;
  export function normalize(path: string): string;
}

declare module 'os' {
  export function arch(): string;
  export function platform(): string;
  export function tmpdir(): string;
  export function homedir(): string;
  export function cpus(): any[];
  export function totalmem(): number;
  export function freemem(): number;
  export function networkInterfaces(): any;
}

declare module 'events' {
  export class EventEmitter {
    on(event: string, listener: (...args: any[]) => void): this;
    once(event: string, listener: (...args: any[]) => void): this;
    off(event: string, listener: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): boolean;
    addListener(event: string, listener: (...args: any[]) => void): this;
    removeListener(event: string, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: string): this;
  }
}

declare module 'util' {
  export function promisify(fn: Function): Function;
}

declare module 'net' {
  export function createServer(options?: any): any;
  export function createConnection(options?: any): any;
  export function connect(options?: any): any;
}

declare global {
  namespace NodeJS {
    type Platform = 'aix' | 'android' | 'darwin' | 'freebsd' | 'linux' | 'openbsd' | 'sunos' | 'win32' | 'cygwin' | 'netbsd';
    
    interface ProcessEnv {
      [key: string]: string | undefined;
    }
    
    interface Timeout {
      ref(): void;
      unref(): void;
    }
  }
  
  var process: {
    platform: NodeJS.Platform;
    arch: string;
    env: NodeJS.ProcessEnv;
    cwd(): string;
    execPath: string;
    resourcesPath?: string;
    kill(pid: number, signal: string): void;
    nextTick(callback: (...args: any[]) => void): void;
    hrtime(): [number, number];
    uptime(): number;
    memoryUsage(): any;
    version: string;
    versions: any;
  };
  
  var console: Console;
  
  var Buffer: {
    new(str: string, encoding?: string): Buffer;
    from(data: ArrayBuffer | SharedArrayBuffer | string | number[], byteOffset?: number, length?: number): Buffer;
    isBuffer(obj: any): obj is Buffer;
    alloc(size: number): Buffer;
    allocUnsafe(size: number): Buffer;
    byteLength(data: string | Buffer): number;
  };
  
  type Buffer = InstanceType<typeof Buffer>;
  
  var __dirname: string;
  var __filename: string;
  
  function setTimeout(callback: (...args: any[]) => void, ms: number): NodeJS.Timeout;
  function clearTimeout(timeoutId: NodeJS.Timeout): void;
  function setInterval(callback: (...args: any[]) => void, ms: number): NodeJS.Timeout;
  function clearInterval(timeoutId: NodeJS.Timeout): void;
  
  function fetch(input: string | Request, init?: RequestInit): Promise<Response>;
  
  var AbortController: {
    new(): AbortController;
  };
  
  interface RequestInit {
    method?: string;
    headers?: HeadersInit;
    body?: BodyInit;
    signal?: AbortSignal;
  }
  
  interface Response {
    ok: boolean;
    status: number;
    statusText: string;
    text(): Promise<string>;
    json(): Promise<any>;
    arrayBuffer(): Promise<ArrayBuffer>;
  }
  
  interface HeadersInit {
    [key: string]: string;
  }
  
  interface BodyInit {
    
  }
  
  interface AbortSignal {
    aborted: boolean;
  }
  
  // Унифицированные интерфейсы для всего проекта
  interface JreInfo {
    version: string;
    path: string;
    vendor: string;
    architecture: string;
    executablePath?: string;
    type?: string;
    homePath?: string;
    isValid?: boolean;
  }
  
  interface ValidationResult {
    isValid: boolean;
    errors?: string[];
    warnings?: string[];
    errorMessage?: string;
  }
  
  interface IJavaProcessEmitter {
    on(event: string, listener: (...args: any[]) => void): IJavaProcessEmitter;
    emit(event: string, ...args: any[]): boolean;
    once(event: string, listener: (...args: any[]) => void): IJavaProcessEmitter;
    off(event: string, listener: (...args: any[]) => void): IJavaProcessEmitter;
    addListener(event: string, listener: (...args: any[]) => void): IJavaProcessEmitter;
    removeListener(event: string, listener: (...args: any[]) => void): IJavaProcessEmitter;
    removeAllListeners(event?: string): IJavaProcessEmitter;
  }
  
  namespace Electron {
    interface MessageBoxOptions {
      type?: string;
      title?: string;
      message: string;
      buttons?: string[];
      defaultId?: number;
    }
    
    interface MessageBoxReturnValue {
      response: number;
    }
  }
}

export {};