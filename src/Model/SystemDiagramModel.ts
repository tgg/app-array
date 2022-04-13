import { DefaultNodeModel, DefaultPortModel, DiagramModel, DiagramModelGenerics, LinkModel, NodeModel } from "@projectstorm/react-diagrams";
import { AppArray } from './Model'
import { ComponentNodeModel } from '../Components/Diagram/ComponentNodeModel'

export class SystemDiagramModel<G extends DiagramModelGenerics = DiagramModelGenerics> extends DiagramModel {
    protected application: AppArray.Model.Application;
    protected world = new Map<string, AppArray.Model.LiveElement>()
    protected componentToPorts = new Map<string, string[]>();
    protected portToComponent = new Map<string, string>();

    constructor(application: AppArray.Model.Application, options?: G['OPTIONS']) {
        super(options);
        this.application = application;
        this.validateModel();
        this.buildNodes();
    }

    getApplication(): AppArray.Model.Application {
        return this.application;
    }

    createComponentNode(component: AppArray.Model.Component) {
        return new ComponentNodeModel(component);
    }
    
    createPort(node: ComponentNodeModel, name: string, label: string, isIn: boolean = true) {
        let port = node.getPort(name);
    
        if (port)
            return port as DefaultPortModel;
    
        return node.addPort(new DefaultPortModel(isIn, name, label));
    }

    validateModel() {
        this.application.components.forEach(component => {
            this.world.set(component.id, component);

            component.provides?.forEach(port => {
                if (this.portToComponent.has(port.id)) {
                    throw new Error(`Two components cannot offer same port: ${port.id}`);
                }

                this.portToComponent.set(port.id, component.id);
            });
        });

        this.application.components.forEach(component => {
            let deps: string[] = [];

            component.consumes?.forEach(needed => {
                if (!this.portToComponent.has(needed)) {
                    throw new Error(`Port: ${needed} not provided in model`);
                }

                deps.push(needed);
            });

            this.componentToPorts.set(component.id, deps);
        });

        this.componentToPorts.forEach((value, key) => { console.log(`${key} = ${value}`); });
    }

    buildNodes() {
        let nodes: DefaultNodeModel[] = [];
        let links: LinkModel[] = [];
    
        this.application.components.forEach(component => {
            let node = this.createComponentNode(component);
    
            component.provides?.forEach(port => {
                this.createPort(node, port.id, port.id);
                console.debug(`Created port ${port.id} for node ${component.id}`);
            });
    
            let count = 0;
            component.consumes?.forEach(service => {
                count++;
                this.createPort(node, service, `D${count}`, false);
                console.debug(`Created needed port ${service} for node ${component.id}`);
            });
    
            count = 0;
            nodes.push(node);
            console.debug(`Added node: ${node.getOptions().name}`);
        });
    
        nodes.forEach(node => {
            this.addNode(node);
            let id: string = node.getOptions().name!;
            console.debug(`Considering node ${id}`);
            let ports = this.componentToPorts.get(id);
            ports?.forEach(port => {
                console.debug(`Considering port ${port} for node ${id}`);
                let consumerPort = node.getPort(port) as DefaultPortModel;

                let otherComponentId = this.portToComponent.get(port);
                if (!otherComponentId) {
                    throw new Error(`Port: ${port} not provided in model`);
                }
                let otherNode = nodes.find(n => otherComponentId === (n as DefaultNodeModel).getOptions().name) as DefaultNodeModel;
                let providerPort = otherNode.getPort(port) as DefaultPortModel;
                links.push(consumerPort.link(providerPort));
            });
        });

        links.forEach(link => {
            this.addLink(link);
        });
    }
}