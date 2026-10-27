import {
	DockviewCompositeDisposable,
	DockviewMutableDisposable,
	type DockviewApi,
	type DockviewGroupLocation,
	type DockviewGroupPanel,
	type DockviewGroupPanelApi,
	type GroupPanelPartInitParameters,
	type IContentRenderer,
	type IDockviewGroupPanel,
	type IDockviewHeaderActionsProps,
	type IDockviewPanelHeaderProps,
	type IDockviewPanelProps,
	type IGroupDragGhostRenderer,
	type IHeaderActionsRenderer,
	type ITabGroup,
	type ITabGroupChipRenderer,
	type ITabRenderer,
	type IWatermarkPanelProps,
	type IWatermarkRenderer,
	type IContextMenuItemRenderer,
	type PanelUpdateEvent,
	type TabPartInitParameters,
	type WatermarkRendererInitParameters
} from 'dockview';
import { createPartElement, SveltePart, type PartContext } from '../core/part.svelte';
import type { Renderable } from '../core/renderable';
import type {
	ContextMenuItemProps,
	IDockviewGroupDragGhostProps,
	IDockviewTabGroupChipProps
} from './types';

// Ports of dockview-react's *Part classes. Each one owns a dockview-facing
// element and a SveltePart mounted into it; dockview drives the lifecycle.

export class SvelteContentRenderer implements IContentRenderer {
	readonly element = createPartElement();
	#part?: SveltePart<IDockviewPanelProps>;

	constructor(
		readonly id: string,
		private readonly renderable: Renderable<IDockviewPanelProps>,
		private readonly context: PartContext,
		private readonly extraProps: Record<string, unknown> = {}
	) {}

	init(parameters: GroupPanelPartInitParameters): void {
		this.#part = new SveltePart(
			this.element,
			this.renderable,
			{
				...this.extraProps,
				params: parameters.params,
				api: parameters.api,
				containerApi: parameters.containerApi
			},
			this.context
		);
	}

	update(event: PanelUpdateEvent): void {
		this.#part?.update({ params: event.params });
	}

	dispose(): void {
		this.#part?.dispose();
	}
}

export class SvelteTabRenderer implements ITabRenderer {
	readonly element = createPartElement();
	#part?: SveltePart<IDockviewPanelHeaderProps>;

	constructor(
		readonly id: string,
		private readonly renderable: Renderable<IDockviewPanelHeaderProps>,
		private readonly context: PartContext,
		private readonly extraProps: Record<string, unknown> = {}
	) {}

	init(parameters: TabPartInitParameters): void {
		this.#part = new SveltePart(
			this.element,
			this.renderable,
			{
				...this.extraProps,
				params: parameters.params,
				api: parameters.api,
				containerApi: parameters.containerApi,
				tabLocation: parameters.tabLocation
			},
			this.context
		);
	}

	update(event: PanelUpdateEvent): void {
		this.#part?.update({ params: event.params });
	}

	dispose(): void {
		this.#part?.dispose();
	}
}

export class SvelteWatermarkRenderer implements IWatermarkRenderer {
	readonly element = createPartElement();
	#part?: SveltePart<IWatermarkPanelProps>;

	constructor(
		private readonly renderable: Renderable<IWatermarkPanelProps>,
		private readonly context: PartContext
	) {}

	init(parameters: WatermarkRendererInitParameters): void {
		this.#part = new SveltePart(
			this.element,
			this.renderable,
			{ group: parameters.group, containerApi: parameters.containerApi },
			this.context
		);
	}

	dispose(): void {
		this.#part?.dispose();
	}
}

/**
 * Header actions get a richer, live set of props than other parts: the group's
 * panels, active panel, focus, location and header position are pushed in as
 * they change, so action components can stay purely declarative.
 */
export class SvelteHeaderActionsRenderer implements IHeaderActionsRenderer {
	readonly element = createPartElement();
	readonly #subscriptions = new DockviewMutableDisposable();
	#part?: SveltePart<IDockviewHeaderActionsProps>;

	constructor(
		private readonly renderable: Renderable<IDockviewHeaderActionsProps>,
		private readonly context: PartContext,
		private readonly group: DockviewGroupPanel
	) {}

	init(parameters: { containerApi: DockviewApi; api: DockviewGroupPanelApi }): void {
		const group = this.group;
		const update = (props: Partial<IDockviewHeaderActionsProps>) => this.#part?.update(props);

		this.#subscriptions.value = new DockviewCompositeDisposable(
			group.model.onDidAddPanel(() => update({ panels: group.model.panels })),
			group.model.onDidRemovePanel(() => update({ panels: group.model.panels })),
			group.model.onDidActivePanelChange(() => update({ activePanel: group.model.activePanel })),
			parameters.api.onDidActiveChange(() => update({ isGroupActive: group.api.isActive })),
			parameters.api.onDidLocationChange((event: { location: DockviewGroupLocation }) =>
				update({ location: event.location })
			),
			parameters.api.onDidHeaderDirectionChange(() =>
				update({ headerPosition: group.model.headerPosition })
			)
		);

		this.#part = new SveltePart(
			this.element,
			this.renderable,
			{
				api: parameters.api,
				containerApi: parameters.containerApi,
				panels: group.model.panels,
				activePanel: group.model.activePanel,
				isGroupActive: group.api.isActive,
				group,
				headerPosition: group.model.headerPosition,
				location: parameters.api.location
			},
			this.context
		);
	}

	dispose(): void {
		this.#subscriptions.dispose();
		this.#part?.dispose();
	}
}

export class SvelteContextMenuItemRenderer implements IContextMenuItemRenderer {
	readonly element = createPartElement();
	#part?: SveltePart<ContextMenuItemProps>;

	constructor(
		readonly id: string,
		private readonly renderable: Renderable<ContextMenuItemProps>,
		private readonly context: PartContext
	) {}

	init(props: ContextMenuItemProps): void {
		this.#part = new SveltePart(this.element, this.renderable, props, this.context);
	}

	dispose(): void {
		this.#part?.dispose();
	}
}

export class SvelteTabGroupChipRenderer implements ITabGroupChipRenderer {
	readonly element = createPartElement('inline-flex');
	#part?: SveltePart<IDockviewTabGroupChipProps>;

	constructor(
		private readonly renderable: Renderable<IDockviewTabGroupChipProps>,
		private readonly context: PartContext
	) {}

	init(params: { tabGroup: ITabGroup; api: DockviewApi }): void {
		this.#part = new SveltePart(
			this.element,
			this.renderable,
			{ tabGroup: params.tabGroup, api: params.api },
			this.context
		);
	}

	update(params: { tabGroup: ITabGroup }): void {
		this.#part?.update({ tabGroup: params.tabGroup });
	}

	dispose(): void {
		this.#part?.dispose();
	}
}

export class SvelteGroupDragGhostRenderer implements IGroupDragGhostRenderer {
	readonly element = createPartElement('inline-flex');
	#part?: SveltePart<IDockviewGroupDragGhostProps>;

	constructor(
		private readonly renderable: Renderable<IDockviewGroupDragGhostProps>,
		private readonly context: PartContext
	) {}

	init(params: { group: IDockviewGroupPanel; api: DockviewApi }): void {
		this.#part = new SveltePart(
			this.element,
			this.renderable,
			{ group: params.group, api: params.api },
			this.context
		);
	}

	dispose(): void {
		this.#part?.dispose();
	}
}
