<!--
  @component
  Svelte 5 wrapper around dockview's `createPaneview`: vertically stacked,
  collapsible panes with headers, like an accordion.
-->
<script lang="ts">
	import 'dockview/dist/styles/dockview.css';
	import { getAllContexts, untrack } from 'svelte';
	import { createPaneview, PROPERTY_KEYS_PANEVIEW, type PaneviewApi, type PaneviewOptions } from 'dockview';
	import { useLayout } from '../core/layout.svelte';
	import { missingRenderer, resolveNamed } from '../core/renderable';
	import type { PaneviewSvelteProps } from '../gridview/types';
	import { SveltePanePart } from '../gridview/views';

	let { api = $bindable(), ...props }: PaneviewSvelteProps = $props();

	const context = getAllContexts();
	let element: HTMLDivElement;

	useLayout<PaneviewApi, PaneviewOptions>({
		props: () => props,
		keys: PROPERTY_KEYS_PANEVIEW,
		element: () => element,
		create: (target, options) => {
			const instance = createPaneview(target, {
				// Required core options are required props too, so they are present.
				...(options as PaneviewOptions),
				createComponent: ({ id, name }) => {
					const resolved = untrack(() => resolveNamed(name, props.components, props.panel));
					if (!resolved) throw missingRenderer(name, 'components', 'panel');
					return new SveltePanePart(id, resolved.renderable, context, resolved.extraProps);
				},
				createHeaderComponent: ({ id, name }) => {
					const resolved = untrack(() => resolveNamed(name, props.headerComponents, props.header));
					// Unknown name: dockview draws its default pane header.
					return resolved
						? new SveltePanePart(id, resolved.renderable, context, resolved.extraProps)
						: undefined;
				}
			});
			instance.onDidDrop((event) => props.ondiddrop?.(event));
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
</script>

<div bind:this={element} class={['dv-svelte', props.class]} style="height: 100%; width: 100%; {props.style ?? ''}"></div>
