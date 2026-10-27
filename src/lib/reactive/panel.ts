import type {
	DockviewGroupLocation,
	DockviewGroupPanel,
	DockviewPanelApi,
	IDockviewPanel,
	Parameters
} from 'dockview';
import { eventSubscriber } from './subscriber';

/**
 * Reactive view of a dockview panel. Each getter reads the live api and
 * re-runs dependent effects and template expressions when dockview reports a
 * change; there is nothing to dispose.
 *
 * Accepts a panel's `api` (as panel components receive it) or the panel itself
 * (from `api.getPanel()` / `addPanel()`). Only the panel knows its initial
 * `params`: dockview's `api.getParameters()` stays empty until the first
 * `updateParameters()`. Panel components already get `params` as a prop.
 *
 * ```svelte
 * <script lang="ts">
 *   let { api }: IDockviewPanelProps = $props();
 *   const panel = new ReactivePanel(api);
 * </script>
 * <h2>{panel.title}</h2> {#if panel.isActive}(active){/if}
 * ```
 */
export class ReactivePanel {
	readonly #title;
	readonly #active;
	readonly #visible;
	readonly #focus;
	readonly #pinned;
	readonly #size;
	readonly #group;
	readonly #params;

	readonly api: DockviewPanelApi;
	readonly #panel: IDockviewPanel | undefined;

	constructor(source: DockviewPanelApi | IDockviewPanel) {
		const panel = 'params' in source && 'api' in source ? source : undefined;
		const api = panel ? panel.api : (source as DockviewPanelApi);
		this.api = api;
		this.#panel = panel;
		this.#title = eventSubscriber([(fire) => api.onDidTitleChange(fire)]);
		this.#active = eventSubscriber([
			(fire) => api.onDidActiveChange(fire),
			(fire) => api.onDidActiveGroupChange(fire)
		]);
		this.#visible = eventSubscriber([(fire) => api.onDidVisibilityChange(fire)]);
		this.#focus = eventSubscriber([(fire) => api.onDidFocusChange(fire)]);
		this.#pinned = eventSubscriber([(fire) => api.onDidChangePinned(fire)]);
		this.#size = eventSubscriber([(fire) => api.onDidDimensionsChange(fire)]);
		this.#group = eventSubscriber([
			(fire) => api.onDidGroupChange(fire),
			(fire) => api.onDidLocationChange(fire)
		]);
		this.#params = eventSubscriber([(fire) => api.onDidParametersChange(fire)]);
	}

	get id(): string {
		return this.api.id;
	}

	get title(): string | undefined {
		this.#title();
		return this.api.title;
	}

	/** True when this panel is the active one in the whole layout. */
	get isActive(): boolean {
		this.#active();
		return this.api.isActive;
	}

	/** True when this panel's group is the active group. */
	get isGroupActive(): boolean {
		this.#active();
		return this.api.isGroupActive;
	}

	/** True when this panel is the selected tab of its group. */
	get isVisible(): boolean {
		this.#visible();
		return this.api.isVisible;
	}

	get isFocused(): boolean {
		this.#focus();
		return this.api.isFocused;
	}

	get isPinned(): boolean {
		this.#pinned();
		return this.api.isPinned;
	}

	get width(): number {
		this.#size();
		return this.api.width;
	}

	get height(): number {
		this.#size();
		return this.api.height;
	}

	get group(): DockviewGroupPanel {
		this.#group();
		return this.api.group;
	}

	/** Where the panel lives: `grid`, `floating`, `popout` or `edge`. */
	get location(): DockviewGroupLocation {
		this.#group();
		return this.api.location;
	}

	get params(): Parameters {
		this.#params();
		return this.#panel?.params ?? this.api.getParameters();
	}
}
