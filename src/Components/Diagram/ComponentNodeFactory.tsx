import * as React from 'react';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';
import { ComponentNodeModel } from './ComponentNodeModel';
import { ComponentNodeWidget } from './ComponentNodeWidget';

export class ComponentNodeFactory extends AbstractReactFactory<ComponentNodeModel, DiagramEngine> {
    constructor() {
		super('appArrayNode');
	}

	generateReactWidget(event: { model: any; }): JSX.Element {
		return <ComponentNodeWidget engine={this.engine} node={event.model} />;
	}

	generateModel(event: any) {
		return new ComponentNodeModel(event);
	}
}
