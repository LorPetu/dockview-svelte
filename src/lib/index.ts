// The whole framework-agnostic api (DockviewApi, themes, events, ...), as
// dockview-react and dockview-vue do, so apps import from one package.
export * from 'dockview';

export { default as DockviewSvelte } from './dockview/DockviewSvelte.svelte';
export { default as DockviewDefaultTab } from './dockview/DockviewDefaultTab.svelte';
export { default as DockviewDrawer } from './drawers/DockviewDrawer.svelte';
export { default as GridviewSvelte } from './gridview/GridviewSvelte.svelte';
export { default as SplitviewSvelte } from './splitview/SplitviewSvelte.svelte';
export { default as PaneviewSvelte } from './paneview/PaneviewSvelte.svelte';

export type {
	ContextMenuItemProps,
	DockviewSvelteProps,
	IDockviewGroupDragGhostProps,
	IDockviewTabGroupChipProps,
	NamedProps,
	SvelteContextMenuItemConfig
} from './dockview/types';
export type {
	GridviewReadyEvent,
	GridviewSvelteProps,
	IGridviewPanelProps,
	IPaneviewPanelProps,
	ISplitviewPanelProps,
	PanelParameters,
	PaneviewReadyEvent,
	PaneviewSvelteProps,
	SplitviewReadyEvent,
	SplitviewSvelteProps
} from './gridview/types';
export type { DrawerPanelOptions, DrawerSide } from './drawers/types';

export { ReactiveDockview } from './reactive/dockview';
export { ReactiveGroup } from './reactive/group';
export { ReactivePanel } from './reactive/panel';
export { eventSubscriber } from './reactive/subscriber';

export { ApiHandle, getDockviewContext } from './core/context.svelte';

// Building blocks for custom renderers and integrations.
export { SveltePart, createPartElement, type PartContext } from './core/part.svelte';
export {
	componentRenderable,
	snippetRenderable,
	pickRenderable,
	type PartComponent,
	type Renderable
} from './core/renderable';
export {
	SvelteContentRenderer,
	SvelteContextMenuItemRenderer,
	SvelteGroupDragGhostRenderer,
	SvelteHeaderActionsRenderer,
	SvelteTabGroupChipRenderer,
	SvelteTabRenderer,
	SvelteWatermarkRenderer
} from './dockview/renderers';
export { SvelteGridviewPanel, SveltePanePart, SvelteSplitviewPanel } from './gridview/views';
