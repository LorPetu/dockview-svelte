<!--
  @component
  Svelte 5 wrapper around dockview's `createGridview`: a grid of resizable
  panels without tabs.
-->
<script lang="ts">
	import 'dockview/dist/styles/dockview.css';
	import { getAllContexts, untrack } from 'svelte';
	import { createGridview, PROPERTY_KEYS_GRIDVIEW, type GridviewApi, type GridviewOptions } from 'dockview';
	import { useLayout } from '../core/layout.svelte';
	import { missingRenderer, resolveNamed } from '../core/renderable';
	import type { GridviewSvelteProps } from './types';
	import { SvelteGridviewPanel } from './views';

	let { api = $bindable(), ...props }: GridviewSvelteProps = $props();

	const context = getAllContexts();
	let element: HTMLDivElement;

	useLayout<GridviewApi, GridviewOptions>({
		props: () => props,
		keys: PROPERTY_KEYS_GRIDVIEW,
		element: () => element,
		create: (target, options) =>
			createGridview(target, {
				// Required core options are required props too, so they are present.
				...(options as GridviewOptions),
				createComponent: ({ id, name }) => {
					const resolved = untrack(() => resolveNamed(name, props.components, props.panel));
					if (!resolved) throw missingRenderer(name, 'components', 'panel');
					return new SvelteGridviewPanel(id, name, resolved.renderable, context, resolved.extraProps);
				}
			}),
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
