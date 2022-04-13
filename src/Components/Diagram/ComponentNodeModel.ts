import { DefaultNodeModel } from "@projectstorm/react-diagrams";
import { Environment } from "../../Model/Environment";
import { AppArray } from "../../Model/Model";
import { ComponentService } from "../../Service/ComponentService";
import { ComponentNodeWidget } from "./ComponentNodeWidget";

export class ComponentNodeModel extends DefaultNodeModel {
    readonly component: AppArray.Model.Component;
    service?: ComponentService;
    widget?: ComponentNodeWidget;

    constructor(component: AppArray.Model.Component, environment?: Environment) {
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

    hasService() {
        return this.service !== undefined;
    }
}