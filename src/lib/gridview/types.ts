import type { Snippet } from 'svelte';
import type { PartComponent } from '../core/renderable';
import type {
	GridviewApi,
	GridviewOptions,
	GridviewPanelApi,
	PaneviewApi,
	PaneviewDidDropEvent,
	PaneviewOptions,
	PaneviewPanelApi,
	SplitviewApi,
	SplitviewOptions,
	SplitviewPanelApi
} from 'dockview';
import type { NamedProps } from '../dockview/types';

export interface GridviewReadyEvent {
	api: GridviewApi;
}

export interface SplitviewReadyEvent {
	api: SplitviewApi;
}

export interface PaneviewReadyEvent {
	api: PaneviewApi;
}

export interface PanelParameters<T extends object = Record<string, any>> {
	params: T;
}

export interface IGridviewPanelProps<T extends object = Record<string, any>> extends PanelParameters<T> {
	api: GridviewPanelApi;
	containerApi: GridviewApi;
}

export interface ISplitviewPanelProps<T extends object = Record<string, any>> extends PanelParameters<T> {
	api: SplitviewPanelApi;
	containerApi: SplitviewApi;
}

export interface IPaneviewPanelProps<T extends object = Record<string, any>> extends PanelParameters<T> {
	api: PaneviewPanelApi;
	containerApi: PaneviewApi;
	title: string;
}

interface LayoutProps<Api, PanelProps extends Record<string, any>> {
	components?: Record<string, PartComponent<PanelProps>>;
	/** Renders panels whose name is not in `components`. */
	panel?: Snippet<[NamedProps<PanelProps>]>;
	/** The instance api; bindable, set once the layout exists. */
	api?: Api;
	onready?: (event: { api: Api }) => void;
	class?: string;
	style?: string;
}

export interface GridviewSvelteProps
	extends GridviewOptions,
		LayoutProps<GridviewApi, IGridviewPanelProps> {}

export interface SplitviewSvelteProps
	extends SplitviewOptions,
		LayoutProps<SplitviewApi, ISplitviewPanelProps> {}

export interface PaneviewSvelteProps
	extends PaneviewOptions,
		LayoutProps<PaneviewApi, IPaneviewPanelProps> {
	/** Pane header components by name (`headerComponent` in `addPanel`). */
	headerComponents?: Record<string, PartComponent<IPaneviewPanelProps>>;
	/** Renders headers whose name is not in `headerComponents`. */
	header?: Snippet<[NamedProps<IPaneviewPanelProps>]>;
	ondiddrop?: (event: PaneviewDidDropEvent) => void;
}
