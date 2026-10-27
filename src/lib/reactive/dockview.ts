import { createSubscriber } from 'svelte/reactivity';
import type { DockviewApi, DockviewGroupPanel, DockviewIDisposable, IDockviewPanel } from 'dockview';
import { eventSubscriber } from './subscriber';

/**
 * Reactive view of a whole dockview layout: panel and group lists, the active
 * panel and group, and the maximized group.
 *
 * ```svelte
 * <DockviewSvelte bind:api {components} />
 * {#if api}
 *   {@const dock = new ReactiveDockview(api)}
 *   {dock.panels.length} panels open
 * {/if}
 * ```
 */
export class ReactiveDockview {
	readonly #panels;
	readonly #groups;
	readonly #active;
	readonly #maximized;
	readonly #layout;

	constructor(readonly api: DockviewApi) {
		this.#panels = eventSubscriber([
			(fire) => api.onDidAddPanel(fire),
			(fire) => api.onDidRemovePanel(fire),
			(fire) => api.onDidMovePanel(fire),
			(fire) => api.onDidLayoutFromJSON(fire)
		]);
		this.#groups = eventSubscriber([
			(fire) => api.onDidAddGroup(fire),
			(fire) => api.onDidRemoveGroup(fire),
			(fire) => api.onDidLayoutFromJSON(fire)
		]);
		this.#active = eventSubscriber([
			(fire) => api.onDidActivePanelChange(fire),
			(fire) => api.onDidActiveGroupChange(fire)
		]);
		this.#maximized = eventSubscriber([(fire) => api.onDidMaximizedGroupChange(fire)]);
		this.#layout = layoutSubscriber(api);
	}

	get panels(): IDockviewPanel[] {
		this.#panels();
		return this.api.panels;
	}

	get groups(): DockviewGroupPanel[] {
		this.#groups();
		return this.api.groups;
	}

	get activePanel(): IDockviewPanel | undefined {
		this.#active();
		return this.api.activePanel;
	}

	get activeGroup(): DockviewGroupPanel | undefined {
		this.#active();
		return this.api.activeGroup;
	}

	get hasMaximizedGroup(): boolean {
		this.#maximized();
		return this.api.hasMaximizedGroup();
	}

	/**
	 * Serialized layout, recomputed when the layout changes, including when an
	 * edge group (drawer) collapses or expands. Use it for persistence (e.g. save
	 * from an `$effect`); it is not free to compute.
	 */
	get layout(): ReturnType<DockviewApi['toJSON']> {
		this.#layout();
		return this.api.toJSON();
	}

	/** True when a panel with this id is open anywhere in the layout. */
	has(id: string): boolean {
		this.#panels();
		return this.api.getPanel(id) !== undefined;
	}
}

/**
 * `onDidLayoutChange` does not fire when an edge group collapses or expands,
 * although `toJSON()` records that state. Also listen to every group's collapse
 * event, following groups as they are added, removed or replaced by `fromJSON`.
 */
function layoutSubscriber(api: DockviewApi): () => void {
	return createSubscriber((update) => {
		const collapseListeners = new Map<DockviewGroupPanel, DockviewIDisposable>();
		const watch = (group: DockviewGroupPanel) => {
			if (!collapseListeners.has(group)) {
				collapseListeners.set(group, group.api.onDidCollapsedChange(update));
			}
		};
		const unwatch = (group: DockviewGroupPanel) => {
			collapseListeners.get(group)?.dispose();
			collapseListeners.delete(group);
		};
		api.groups.forEach(watch);

		const listeners = [
			api.onDidLayoutChange(update),
			api.onDidAddGroup(watch),
			api.onDidRemoveGroup(unwatch),
			api.onDidLayoutFromJSON(() => api.groups.forEach(watch))
		];
		return () => {
			for (const listener of listeners) listener.dispose();
			for (const listener of collapseListeners.values()) listener.dispose();
			collapseListeners.clear();
		};
	});
}
