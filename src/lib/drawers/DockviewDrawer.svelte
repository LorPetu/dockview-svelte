<!--
  @component
  A collapsible side drawer with vertical tabs, built on dockview's edge groups.
  Place it inside `<DockviewSvelte>`; it renders nothing itself.

  Clicking the selected tab minimizes the drawer to its tab strip, and clicking
  any tab while minimized opens it again. Panels can be dragged in and out like
  in any other group.

  ```svelte
  <DockviewSvelte {components}>
    <DockviewDrawer side="left" size={260} bind:collapsed
      panels={[{ id: 'files', component: 'files', title: 'Files' }]} />
  </DockviewSvelte>
  ```
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import type { DockviewApi, DockviewGroupPanel, DockviewIDisposable } from 'dockview';
	import { getDockviewContext } from '../core/context.svelte';
	import type { DrawerPanelOptions, DrawerSide } from './types';

	interface Props {
		side: DrawerSide;
		/** Group id; defaults to `drawer-<side>`. */
		id?: string;
		/** Initial width (left/right) or height (top/bottom) in pixels. */
		size?: number;
		minimumSize?: number;
		maximumSize?: number;
		/** Size of the minimized tab strip; dockview measures it when omitted. */
		collapsedSize?: number;
		/** Minimized to the tab strip. Bindable; follows tab clicks. */
		collapsed?: boolean;
		/** The underlying edge group, once it exists. Bindable, read-only. */
		group?: DockviewGroupPanel;
		/**
		 * Panels added when this component creates the drawer. They are not
		 * re-added when the drawer comes from a restored layout (`fromJSON`), so a
		 * panel the user closed stays closed.
		 */
		panels?: DrawerPanelOptions[];
		/** Remove the edge group when this component is destroyed. */
		removeOnDestroy?: boolean;
	}

	let {
		side,
		id,
		size = 280,
		minimumSize,
		maximumSize,
		collapsedSize,
		collapsed = $bindable(false),
		group = $bindable(),
		panels = [],
		removeOnDestroy = true
	}: Props = $props();

	const dock = getDockviewContext();

	function findGroup(api: DockviewApi): DockviewGroupPanel | undefined {
		const edgeApi = api.getEdgeGroup(side);
		if (!edgeApi) return undefined;
		return api.groups.find((candidate) => candidate.api === edgeApi);
	}

	function addTo(api: DockviewApi, target: DockviewGroupPanel, panel: DrawerPanelOptions) {
		api.addPanel({
			id: panel.id,
			component: panel.component,
			title: panel.title,
			params: panel.params,
			tabComponent: panel.tabComponent,
			inactive: panel.inactive,
			position: { referenceGroup: target }
		});
	}

	function attach(api: DockviewApi): () => void {
		let collapseListener: DockviewIDisposable | undefined;

		const bind = () => {
			collapseListener?.dispose();
			let target = findGroup(api);
			if (!target) {
				api.addEdgeGroup(side, {
					id: id ?? `drawer-${side}`,
					initialSize: size,
					minimumSize,
					maximumSize,
					collapsedSize,
					collapsed
				});
				target = findGroup(api);
				if (!target) throw new Error(`dockview-svelte: could not create the ${side} drawer`);
				for (const panel of panels) {
					if (!api.getPanel(panel.id)) addTo(api, target, panel);
				}
				// Adding panels selects them; restore the requested state afterwards.
				if (collapsed) target.api.collapse();
			}
			group = target;
			// A restored layout carries its own collapsed state; adopt it.
			collapsed = target.api.isCollapsed();
			collapseListener = target.api.onDidCollapsedChange((event) => {
				collapsed = event.isCollapsed;
			});
		};

		bind();
		// fromJSON replaces every group, including edge groups.
		const layoutListener = api.onDidLayoutFromJSON(bind);

		return () => {
			collapseListener?.dispose();
			layoutListener.dispose();
			group = undefined;
			// Skip when the whole layout is being torn down (the handle is cleared first).
			if (removeOnDestroy && dock.current === api && api.getEdgeGroup(side)) {
				api.removeEdgeGroup(side);
			}
		};
	}

	$effect(() => {
		const api = dock.current;
		if (!api) return;
		return untrack(() => attach(api));
	});

	// `collapsed` written by the parent drives the group.
	$effect(() => {
		const wanted = collapsed;
		const target = group;
		if (!target) return;
		untrack(() => {
			if (target.api.isCollapsed() === wanted) return;
			if (wanted) target.api.collapse();
			else target.api.expand();
		});
	});

	export function toggle(): void {
		collapsed = !collapsed;
	}

	/** Adds a panel to this drawer (and opens it). */
	export function addPanel(panel: DrawerPanelOptions): void {
		const api = dock.current;
		if (!api || !group) throw new Error('dockview-svelte: the drawer is not attached yet');
		addTo(api, group, panel);
		collapsed = false;
	}
</script>
