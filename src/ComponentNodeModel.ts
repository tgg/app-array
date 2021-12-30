import { DefaultNodeModel } from "@projectstorm/react-diagrams";
import { AppArray } from './Model';

function componentId(component: AppArray.Model.Component) {
    if (component.instance)
        return `${component.name}[${component.instance}]`;
    else
        return component.name;
}

export class ComponentNodeModel extends DefaultNodeModel {
    readonly component: AppArray.Model.Component;

    constructor(component: AppArray.Model.Component) {
        super({
            name: componentId(component),
            // TODO: this will change to define color based on e.g. group
            color: 'rgb(0,192,255)'
        });

        this.component = component;
    }
}