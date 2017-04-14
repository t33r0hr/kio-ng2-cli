import * as ComponentInterfaces from './interfaces';
export declare class Component {
    data: ComponentInterfaces.KioComponent;
    constructor(data: ComponentInterfaces.KioComponent);
    readonly typeName: string;
    readonly dir: string;
    readonly name: string;
    readonly dasherizedName: string;
    readonly childTypes: string[];
    readonly modifiers: string[];
    readonly contentType: string;
    toString(): string;
}
