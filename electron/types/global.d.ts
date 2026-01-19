// Глобальные декларации для Node.js модулей
declare module 'path' {
  export function join(...paths: string[]): string;
  export function dirname(path: string): string;
  export function resolve(...paths: string[]): string;
  export function basename(path: string): string;
  export function extname(path: string): string;
  export function normalize(path: string): string;
}

declare module 'fs' {
  export function existsSync(path: string): boolean;
  export function statSync(path: string): any;
  export function accessSync(path: string, mode?: number): void;
  export function readFileSync(path: string, encoding?: string): string;
  export function writeFileSync(path: string, data: string): void;
  export function readdirSync(path: string): string[];
  export function mkdirSync(path: string, options?: any): void;
  export const constants: any;
}

declare module 'child_process' {
  export function spawn(command: string, args?: string[], options?: any): any;
  export function execFile(command: string, args?: string[], callback?: (error: any, stdout: any, stderr: any) => void): any;
  export interface ChildProcess {
    pid?: number;
    stdout?: any;
    stderr?: any;
    on(event: string, listener: (...args: any[]) => void): void;
    kill(signal?: string): void;
  }
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

declare module 'net' {
  export function createServer(options?: any): any;
  export function createConnection(options?: any): any;
  export function connect(options?: any): any;
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

declare module 'util' {
  export function promisify(fn: Function): Function;
}

// Stub декларации для всех missing @types библиотек
declare module 'aria-query' {
  export const elementById: any;
  export const query: any;
}

declare module 'babel__core' {
  export const types: any;
  export const traverse: any;
}

declare module 'babel__generator' {
  export const defaultExport: any;
}

declare module 'babel__template' {
  export const defaultExport: any;
}

declare module 'babel__traverse' {
  export const defaultExport: any;
}

declare module 'cacheable-request' {
  export const defaultExport: any;
}

declare module 'debug' {
  export const defaultExport: any;
}

declare module 'estree' {
  export const SimpleCallExpression: any;
  export const ExpressionStatement: any;
}

declare module 'http-cache-semantics' {
  export const Cacheability: any;
}

declare module 'json-schema' {
  export const validate: any;
}

declare module 'keyv' {
  export const defaultExport: any;
}

declare module 'minimatch' {
  export const defaultExport: any;
}

declare module 'ms' {
  export const defaultExport: any;
}

declare module 'prop-types' {
  export const string: any;
  export const number: any;
  export const bool: any;
}

declare module 'react' {
  export const createElement: any;
  export const Component: any;
}

declare module 'react-dom' {
  export const render: any;
}

declare module 'responselike' {
  export interface ResponseLike {
    status: number;
    url: string;
  }
}

declare module 'semver' {
  export const valid: any;
  export const gt: any;
}

declare module 'yargs' {
  export const defaultExport: any;
}

declare module 'yargs-parser' {
  export const defaultExport: any;
}

declare module 'yauzl' {
  export const defaultExport: any;
}