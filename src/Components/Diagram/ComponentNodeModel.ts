import { DefaultNodeModel } from "@projectstorm/react-diagrams";
import { AppArray } from "../../Model/Model";
import { ComponentNodeWidget } from "./ComponentNodeWidget";

export class ComponentNodeModel extends DefaultNodeModel {
    readonly component: AppArray.Model.Component;
    widget?: ComponentNodeWidget;

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