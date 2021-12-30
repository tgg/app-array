import createEngine, { DefaultNodeModel, DefaultPortModel, DiagramModel, LinkModel, NodeModel } from "@projectstorm/react-diagrams";
import { AppArray } from './Model';
import { ComponentNodeModel } from './ComponentNodeModel';

function componentId(component: AppArray.Model.Component) {
    if (component.instance)
        return `${component.name}[${component.instance}]`;
    else
        return component.name;
}

function createComponentNode(component: AppArray.Model.Component) {
    return new ComponentNodeModel(component);
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
    let nodes: ComponentNodeModel[] = [];
    let links: LinkModel[] = [];

    app.components.forEach(component => {
        let node = createComponentNode(component);

        component.provides?.forEach(port => {
            createPort(node, port.id, port.id);
        });

        let count = 0;
        component.consumes?.forEach(service => {
            count++;
            createPort(node, service.port, `D${count}`, false);
        });

        count = 0;
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

        // Now we link consumed service with their provider
        // We may want to relax model later to include only an port string
        // TODO harden code below since port is already quite relaxed and
        // lookup can fail.
        node.component.consumes?.forEach(service => {
            let consumerPort = node.getPort(service.port) as DefaultPortModel;
            let otherId = componentId(service.host);
            let otherNode = nodes.find(n => otherId === (n as DefaultNodeModel).getOptions().name) as DefaultNodeModel;
            let providerPort = otherNode.getPort(service.port) as DefaultPortModel;
            links.push(consumerPort.link(providerPort));
        });
	});

    links.forEach((link) => {
		model.addLink(link);
	});

    engine.setModel(model);
    return {
        engine: engine,
        model: model
    };
}