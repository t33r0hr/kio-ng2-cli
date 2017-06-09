import { Observable } from 'rxjs';
export * from './Runner.class';
export * from './resolve';
export declare const renderTests: (targetFilename: string) => Observable<string>;
export declare const execTestAt: (specFilename: string) => Observable<string>;
