import { Observable } from 'rxjs';
import { ExecData } from 'rxfs';
export * from './Runner.class';
import { TestRunner } from './Runner.class';
declare const runner: TestRunner;
export default runner;
export declare const renderTests: (targetFilename: string) => Observable<string>;
export declare const execTestAt: (specFilename: string) => Observable<ExecData>;
