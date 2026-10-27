<!--
  @component
  Svelte 5 wrapper around dockview's `createSplitview`: panels in one row or
  column with draggable sashes.
-->
<script lang="ts">
	import 'dockview/dist/styles/dockview.css';
	import { getAllContexts, untrack } from 'svelte';
	import {
		createSplitview,
		PROPERTY_KEYS_SPLITVIEW,
		type SplitviewApi,
		type SplitviewOptions
	} from 'dockview';
	import { useLayout } from '../core/layout.svelte';
	import { missingRenderer, resolveNamed } from '../core/renderable';
	import type { SplitviewSvelteProps } from '../gridview/types';
	import { SvelteSplitviewPanel } from '../gridview/views';

	let { api = $bindable(), ...props }: SplitviewSvelteProps = $props();

	const context = getAllContexts();
	let element: HTMLDivElement;

	useLayout<SplitviewApi, SplitviewOptions>({
		props: () => props,
		keys: PROPERTY_KEYS_SPLITVIEW,
		element: () => element,
		create: (target, options) =>
			createSplitview(target, {
				// Required core options are required props too, so they are present.
				...(options as SplitviewOptions),
				createComponent: ({ id, name }) => {
					const resolved = untrack(() => resolveNamed(name, props.components, props.panel));
					if (!resolved) throw missingRenderer(name, 'components', 'panel');
					return new SvelteSplitviewPanel(id, name, resolved.renderable, context, resolved.extraProps);
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
