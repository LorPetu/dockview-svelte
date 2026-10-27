import {
	GridviewApi,
	GridviewPanel,
	SplitviewApi,
	SplitviewPanel,
	type GridviewComponent,
	type GridviewInitParameters,
	type IFrameworkPart,
	type IPanePart,
	type PanePanelComponentInitParameter,
	type PanelUpdateEvent,
	type PanelViewInitParameters
} from 'dockview';
import { createPartElement, SveltePart, type PartContext } from '../core/part.svelte';
import type { Renderable } from '../core/renderable';
import type { IGridviewPanelProps, IPaneviewPanelProps, ISplitviewPanelProps } from './types';

// Ports of dockview-react's ReactGridPanelView, ReactPanelView and PanePanelSection.

export class SvelteGridviewPanel extends GridviewPanel {
	constructor(
		id: string,
		component: string,
		private readonly renderable: Renderable<IGridviewPanelProps>,
		private readonly context: PartContext,
		private readonly extraProps: Record<string, unknown> = {}
	) {
		super(id, component);
	}

	getComponent(): IFrameworkPart {
		const parameters = this._params as GridviewInitParameters & { accessor: GridviewComponent };
		return new SveltePart(
			this.element,
			this.renderable,
			{
				...this.extraProps,
				params: parameters?.params ?? {},
				api: this.api,
				containerApi: new GridviewApi(parameters.accessor)
			},
			this.context
		);
	}
}

export class SvelteSplitviewPanel extends SplitviewPanel {
	constructor(
		id: string,
		component: string,
		private readonly renderable: Renderable<ISplitviewPanelProps>,
		private readonly context: PartContext,
		private readonly extraProps: Record<string, unknown> = {}
	) {
		super(id, component);
	}

	getComponent(): IFrameworkPart {
		const parameters = this._params as PanelViewInitParameters;
		return new SveltePart(
			this.element,
			this.renderable,
			{
				...this.extraProps,
				params: parameters?.params ?? {},
				api: this.api,
				containerApi: new SplitviewApi(parameters.accessor)
			},
			this.context
		);
	}
}

export class SveltePanePart implements IPanePart {
	readonly element = createPartElement();
	#part?: SveltePart<IPaneviewPanelProps>;

	constructor(
		readonly id: string,
		private readonly renderable: Renderable<IPaneviewPanelProps>,
		private readonly context: PartContext,
		private readonly extraProps: Record<string, unknown> = {}
	) {}

	init(parameters: PanePanelComponentInitParameter): void {
		this.#part = new SveltePart(
			this.element,
			this.renderable,
			{
				...this.extraProps,
				params: parameters.params,
				api: parameters.api,
				title: parameters.title,
				containerApi: parameters.containerApi
			},
			this.context
		);
	}

	toJSON() {
		return { id: this.id };
	}

	update(event: PanelUpdateEvent): void {
		this.#part?.update({ params: event.params });
	}

	dispose(): void {
		this.#part?.dispose();
	}
}
