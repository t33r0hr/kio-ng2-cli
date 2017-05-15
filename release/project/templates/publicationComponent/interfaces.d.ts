import { ListQuery } from 'kio-ng2-component-routing';
import { KioChildContentType } from 'kio-ng2';
export interface PublicationComponentTemplateData {
    [key: string]: any;
    name: string;
    type: KioChildContentType;
    selector: string;
    styles: string;
    modifiers: ListQuery<string>;
    childTypes: ListQuery<any>;
    classifiedModuleName: string;
    dasherizedModuleName: string;
    classifiedParentComponentName: string;
    dasherizedParentComponentPath: string;
    pathToStructureComponents?: string;
}
