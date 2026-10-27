<!--
  @component
  Svelte 5 wrapper around dockview's `createDockview`, the counterpart of
  dockview-react's `DockviewReact`.

  ```svelte
  <DockviewSvelte {components} onready={({ api }) => api.addPanel({ id: 'a', component: 'editor' })} />
  ```
-->
<script lang="ts">
	import 'dockview/dist/styles/dockview.css';
	import { getAllContexts, untrack, type Component } from 'svelte';
	import {
		createDockview,
		PROPERTY_KEYS_DOCKVIEW,
		type DockviewApi,
		type DockviewComponentOptions,
		type DockviewOptions,
		type IContextMenuItemRenderer
	} from 'dockview';
	import { setDockviewContext } from '../core/context.svelte';
	import { useLayout } from '../core/layout.svelte';
	import {
		componentRenderable,
		missingRenderer,
		pickRenderable,
		resolveNamed,
		type Renderable
	} from '../core/renderable';
	import {
		SvelteContentRenderer,
		SvelteContextMenuItemRenderer,
		SvelteGroupDragGhostRenderer,
		SvelteHeaderActionsRenderer,
		SvelteTabGroupChipRenderer,
		SvelteTabRenderer,
		SvelteWatermarkRenderer
	} from './renderers';
	import type { ContextMenuItemProps, DockviewSvelteProps } from './types';

	let { api = $bindable(), ...props }: DockviewSvelteProps = $props();

	/** Registered tab-component name standing for the `defaultTab*` props. */
	const DEFAULT_TAB = 'dockview-svelte:default-tab';

	let element: HTMLDivElement;

	// Renderer lookups read props at call time, untracked: a changed
	// `components` record applies to the next panel created, without
	// re-registering factories (which dockview-react has to do).
	const read = <T,>(fn: () => T): T => untrack(fn);

	const renderables = {
		watermark: () => read(() => pickRenderable(props.watermarkComponent, props.watermark)),
		rightActions: () =>
			read(() => pickRenderable(props.rightHeaderActionsComponent, props.rightHeaderActions)),
		leftActions: () =>
			read(() => pickRenderable(props.leftHeaderActionsComponent, props.leftHeaderActions)),
		prefixActions: () =>
			read(() => pickRenderable(props.prefixHeaderActionsComponent, props.prefixHeaderActions)),
		tabGroupChip: () => read(() => pickRenderable(props.tabGroupChipComponent, props.tabGroupChip)),
		groupDragGhost: () =>
			read(() => pickRenderable(props.groupDragGhostComponent, props.groupDragGhost)),
		defaultTab: () => read(() => pickRenderable(props.defaultTabComponent, props.defaultTab))
	};

	function required<T extends object>(renderable: Renderable<T> | undefined, what: string): Renderable<T> {
		if (!renderable) throw new Error(`dockview-svelte: no ${what} renderer is registered`);
		return renderable;
	}

	/** Factories that are always registered. */
	function baseFactories(): Pick<
		DockviewComponentOptions,
		'createComponent' | 'createTabComponent' | 'createContextMenuItemComponent'
	> {
		return {
			createComponent: ({ id, name }) => {
				const resolved = read(() => resolveNamed(name, props.components, props.panel));
				if (!resolved) throw missingRenderer(name, 'components', 'panel');
				return new SvelteContentRenderer(id, resolved.renderable, context, resolved.extraProps);
			},
			createTabComponent: ({ id, name }) => {
				if (name === DEFAULT_TAB) {
					const renderable = renderables.defaultTab();
					return renderable ? new SvelteTabRenderer(id, renderable, context) : undefined;
				}
				const resolved = read(() => resolveNamed(name, props.tabComponents, props.tab));
				// Unknown name: dockview falls back to its built-in tab.
				return resolved
					? new SvelteTabRenderer(id, resolved.renderable, context, resolved.extraProps)
					: undefined;
			},
			createContextMenuItemComponent: (options): IContextMenuItemRenderer | undefined => {
				if (!options.component) return undefined;
				return new SvelteContextMenuItemRenderer(
					options.id,
					componentRenderable(options.component as Component<ContextMenuItemProps>),
					context
				);
			}
		};
	}

	/** Factories registered only while their renderer prop is set. */
	function optionalFactories(): Partial<DockviewComponentOptions> {
		const has = presence();
		return {
			defaultTabComponent: has.defaultTab ? DEFAULT_TAB : undefined,
			createWatermarkComponent: has.watermark
				? () => new SvelteWatermarkRenderer(required(renderables.watermark(), 'watermark'), context)
				: undefined,
			createRightHeaderActionComponent: has.rightActions
				? (group) =>
						new SvelteHeaderActionsRenderer(
							required(renderables.rightActions(), 'right header actions'),
							context,
							group
						)
				: undefined,
			createLeftHeaderActionComponent: has.leftActions
				? (group) =>
						new SvelteHeaderActionsRenderer(
							required(renderables.leftActions(), 'left header actions'),
							context,
							group
						)
				: undefined,
			createPrefixHeaderActionComponent: has.prefixActions
				? (group) =>
						new SvelteHeaderActionsRenderer(
							required(renderables.prefixActions(), 'prefix header actions'),
							context,
							group
						)
				: undefined,
			createTabGroupChipComponent: has.tabGroupChip
				? () => new SvelteTabGroupChipRenderer(required(renderables.tabGroupChip(), 'tab group chip'), context)
				: undefined,
			createGroupDragGhostComponent: has.groupDragGhost
				? () =>
						new SvelteGroupDragGhostRenderer(
							required(renderables.groupDragGhost(), 'group drag ghost'),
							context
						)
				: undefined
		};
	}

	function presence() {
		return {
			defaultTab: !!(props.defaultTabComponent || props.defaultTab),
			watermark: !!(props.watermarkComponent || props.watermark),
			rightActions: !!(props.rightHeaderActionsComponent || props.rightHeaderActions),
			leftActions: !!(props.leftHeaderActionsComponent || props.leftHeaderActions),
			prefixActions: !!(props.prefixHeaderActionsComponent || props.prefixHeaderActions),
			tabGroupChip: !!(props.tabGroupChipComponent || props.tabGroupChip),
			groupDragGhost: !!(props.groupDragGhostComponent || props.groupDragGhost)
		};
	}

	// Which optional renderers exist, as a stable string: the effect below only
	// re-registers factories when one is added or removed, not when it changes.
	const presenceKey = $derived(JSON.stringify(presence()));
	let appliedPresenceKey = '';

	const handle = useLayout<DockviewApi, DockviewOptions>({
		props: () => props,
		keys: PROPERTY_KEYS_DOCKVIEW,
		element: () => element,
		create: (target, options) => {
			appliedPresenceKey = presenceKey;
			const instance = createDockview(target, {
				...options,
				...baseFactories(),
				...optionalFactories()
			});
			// Handlers are read when the event fires, so swapping them needs no resubscribe.
			instance.onDidDrop((event) => props.ondiddrop?.(event));
			instance.onWillDrop((event) => props.onwilldrop?.(event));
			return instance;
		},
		ready: (instance) => {
			api = instance;
			props.onready?.({ api: instance });
		},
		destroy: () => {
			api = undefined;
		}
	});
	setDockviewContext(handle);
	// Captured after setContext so parts see this component's context too.
	const context = getAllContexts();

	// Optional renderers added or removed after creation.
	$effect(() => {
		const key = presenceKey;
		const instance = handle.current;
		if (!instance || key === appliedPresenceKey) return;
		appliedPresenceKey = key;
		untrack(() => instance.updateOptions(optionalFactories()));
	});
</script>

<div bind:this={element} class={['dv-svelte', props.class]} style="height: 100%; width: 100%; {props.style ?? ''}"></div>
{@render props.children?.()}

<style>
	/* With the tab header on the left or right (drawers), the content container is
	   a row flex item whose default `min-width: auto` keeps it as wide as its
	   content, so a wide panel overflows sideways over its neighbours. */
	:global(.dv-groupview-header-left > .dv-content-container),
	:global(.dv-groupview-header-right > .dv-content-container) {
		min-width: 0;
	}
</style>
