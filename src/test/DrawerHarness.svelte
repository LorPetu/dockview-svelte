<!-- Test fixture: a dockview with a left drawer whose `collapsed` is bound and reported. -->
<script lang="ts">
	import type { DockviewApi, DockviewReadyEvent } from 'dockview';
	import DockviewSvelte from '../lib/dockview/DockviewSvelte.svelte';
	import DockviewDrawer from '../lib/drawers/DockviewDrawer.svelte';
	import Probe from './Probe.svelte';

	let {
		collapsed = $bindable(false),
		showDrawer = true,
		onready,
		oncollapsed
	}: {
		collapsed?: boolean;
		showDrawer?: boolean;
		onready?: (event: DockviewReadyEvent) => void;
		oncollapsed?: (collapsed: boolean) => void;
	} = $props();

	let api = $state<DockviewApi>();

	$effect(() => {
		oncollapsed?.(collapsed);
	});
</script>

<div style="width: 800px; height: 600px">
	<DockviewSvelte bind:api components={{ probe: Probe }} {onready}>
		{#if showDrawer}
			<DockviewDrawer
				side="left"
				size={200}
				bind:collapsed
				panels={[{ id: 'tools', component: 'probe', title: 'Tools', params: { label: 'in drawer' } }]}
			/>
		{/if}
	</DockviewSvelte>
</div>
