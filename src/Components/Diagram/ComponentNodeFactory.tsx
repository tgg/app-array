import * as React from 'react';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';
import { ComponentNodeModel } from './ComponentNodeModel';
import { ComponentNodeWidget } from './ComponentNodeWidget';
import { CacheInfo } from '../../Model/CacheInfo';
import { chain } from 'lodash';

export class ComponentNodeFactory extends AbstractReactFactory<ComponentNodeModel, DiagramEngine> {
	cacheInfo: CacheInfo
    constructor(cacheInfo: CacheInfo) {
		super('appArrayNode');
		this.cacheInfo = cacheInfo;
	}

	generateReactWidget(event: { model: any; }): JSX.Element {
		return <ComponentNodeWidget engine={this.engine} node={event.model} cache={this.cacheInfo} />;
	}

	generateModel(event: any) {
		return new ComponentNodeModel(event);
	}
}
