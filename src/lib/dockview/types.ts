import type { Snippet } from 'svelte';
import type { PartComponent } from '../core/renderable';
import type {
	BuiltInChipContextMenuItem,
	BuiltInContextMenuItem,
	ContextMenuItemConfig,
	DockviewApi,
	DockviewDidDropEvent,
	DockviewOptions,
	DockviewReadyEvent,
	DockviewWillDropEvent,
	GetTabContextMenuItemsParams,
	GetTabGroupChipContextMenuItemsParams,
	IChipContextMenuItemComponentProps,
	IContextMenuItemComponentProps,
	IDockviewGroupPanel,
	IDockviewHeaderActionsProps,
	IDockviewPanelHeaderProps,
	IDockviewPanelProps,
	ITabGroup,
	IWatermarkPanelProps
} from 'dockview';

export interface IDockviewTabGroupChipProps {
	tabGroup: ITabGroup;
	api: DockviewApi;
}

export interface IDockviewGroupDragGhostProps {
	group: IDockviewGroupPanel;
	api: DockviewApi;
}

/** Props of the catch-all `panel` / `tab` snippets: the usual props plus the registered name. */
export type NamedProps<Props> = Props & { name: string };

export type ContextMenuItemProps = IContextMenuItemComponentProps | IChipContextMenuItemComponentProps;

export interface SvelteContextMenuItemConfig extends Omit<ContextMenuItemConfig, 'component'> {
	component?: PartComponent<ContextMenuItemProps>;
}

/**
 * Props of `<DockviewSvelte>`. Every renderer can be given as a component
 * (`xComponent`, as in dockview-react) or as a snippet (`x`), which can be
 * written inline as a child of the component:
 *
 * ```svelte
 * <DockviewSvelte {components}>
 *   {#snippet watermark()}<p>Drag a panel here</p>{/snippet}
 * </DockviewSvelte>
 * ```
 */
export interface DockviewSvelteProps extends DockviewOptions {
	/** Panel components by name, as used in `api.addPanel({ component })`. */
	components?: Record<string, PartComponent<IDockviewPanelProps>>;
	/** Renders panels whose name is not in `components`. */
	panel?: Snippet<[NamedProps<IDockviewPanelProps>]>;

	tabComponents?: Record<string, PartComponent<IDockviewPanelHeaderProps>>;
	/** Renders tabs whose `tabComponent` name is not in `tabComponents`. */
	tab?: Snippet<[NamedProps<IDockviewPanelHeaderProps>]>;
	defaultTabComponent?: PartComponent<IDockviewPanelHeaderProps>;
	defaultTab?: Snippet<[IDockviewPanelHeaderProps]>;

	watermarkComponent?: PartComponent<IWatermarkPanelProps>;
	watermark?: Snippet<[IWatermarkPanelProps]>;

	rightHeaderActionsComponent?: PartComponent<IDockviewHeaderActionsProps>;
	rightHeaderActions?: Snippet<[IDockviewHeaderActionsProps]>;
	leftHeaderActionsComponent?: PartComponent<IDockviewHeaderActionsProps>;
	leftHeaderActions?: Snippet<[IDockviewHeaderActionsProps]>;
	prefixHeaderActionsComponent?: PartComponent<IDockviewHeaderActionsProps>;
	prefixHeaderActions?: Snippet<[IDockviewHeaderActionsProps]>;

	tabGroupChipComponent?: PartComponent<IDockviewTabGroupChipProps>;
	tabGroupChip?: Snippet<[IDockviewTabGroupChipProps]>;
	/**
	 * Drag ghost shown while a whole group is dragged. The browser captures it at
	 * drag start, so it must render synchronously.
	 */
	groupDragGhostComponent?: PartComponent<IDockviewGroupDragGhostProps>;
	groupDragGhost?: Snippet<[IDockviewGroupDragGhostProps]>;

	getTabContextMenuItems?: (
		params: GetTabContextMenuItemsParams
	) => (BuiltInContextMenuItem | SvelteContextMenuItemConfig)[];
	getTabGroupChipContextMenuItems?: (
		params: GetTabGroupChipContextMenuItemsParams
	) => (BuiltInChipContextMenuItem | SvelteContextMenuItemConfig)[];

	/** The instance api; bindable, set once the layout exists. */
	api?: DockviewApi;
	onready?: (event: DockviewReadyEvent) => void;
	ondiddrop?: (event: DockviewDidDropEvent) => void;
	onwilldrop?: (event: DockviewWillDropEvent) => void;

	/** Declarative helpers such as `<DockviewDrawer>`; rendered after the layout. */
	children?: Snippet;
	class?: string;
	style?: string;
}
