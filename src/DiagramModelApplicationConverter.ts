import createEngine, { DefaultNodeModel, DefaultPortModel, DiagramModel, LinkModel, NodeModel } from "@projectstorm/react-diagrams";
import { AppArray } from './Model'

function componentId(component: AppArray.Model.Component) {
    if (component.instance)
        return `${component.name}[${component.instance}]`;
    else
        return component.name;
}

function createNode(component: AppArray.Model.Component) {
    let id = componentId(component);
    return new DefaultNodeModel(id, 'rgb(0,192,255)');
}

function createPort(node: DefaultNodeModel, name: string, label: string, isIn: boolean = true) {
    let port = node.getPort(name);

    if (port)
        return port as DefaultPortModel;

    return node.addPort(new DefaultPortModel(isIn, name, label));
}

export function DiagramModelApplicationConverter(app: AppArray.Model.Application) {
    let engine = createEngine();
    let model = new DiagramModel();
    let nodes: NodeModel[] = [];
    let links: LinkModel[] = [];

    app.components.forEach(component => {
        let node = createNode(component);

        component.provides?.forEach(port => {
            node.addInPort(port.id);
        });

        component.consumes?.forEach(service => {
            node.addOutPort(service.port);
        });

        let count = 0;
        component.depends?.forEach(other => {
            count++;
            let otherId = componentId(other);
            console.debug(`adding dependency ${other.name} to ${component.name}`);
            // Other node must already be created
            let target = nodes.find(n => otherId === (n as DefaultNodeModel).getOptions().name) as DefaultNodeModel;
            // Create in port if not already there
            let portTo = createPort(target, 'self', 'self');
            let portFrom = createPort(node, otherId, `D${count}`, false);
            links.push(portTo.link(portFrom));
        });

        nodes.push(node);
        console.debug(`Added node: ${node.getOptions().name}`);
    });

    nodes.forEach(node => {
		model.addNode(node);
	});

    // TODO: add a step to create links between provides and consumes

    links.forEach((link) => {
		model.addLink(link);
	});

    engine.setModel(model);
    return {
        engine: engine,
        model: model
    };
}