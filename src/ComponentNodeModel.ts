import { DefaultNodeModel } from "@projectstorm/react-diagrams";
import { has } from "lodash";
import { AppArray } from './Model';

export class ComponentNodeModel extends DefaultNodeModel {
    readonly component: AppArray.Model.Component;

    constructor(component: AppArray.Model.Component) {
        super({
            name: component.id,
            // TODO: this will change to define color based on e.g. group
            color: 'rgb(0,192,255)',
            type:'appArrayNode'
        });

        this.component = component;
    }

    hasCommand(name: string) {
        return this.component.commands ? name in this.component.commands : false;
    }
}