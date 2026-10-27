<script lang="ts">
	import {
		GridviewSvelte,
		Orientation,
		PaneviewSvelte,
		SplitviewSvelte,
		type GridviewReadyEvent,
		type PaneviewReadyEvent,
		type SplitviewReadyEvent
	} from '#lib';
	import BoxPanel from './BoxPanel.svelte';

	const components = { box: BoxPanel };

	function gridReady({ api }: GridviewReadyEvent) {
		api.addPanel({ id: 'g1', component: 'box', params: { label: 'Grid 1' } });
		api.addPanel({ id: 'g2', component: 'box', params: { label: 'Grid 2' }, position: { referencePanel: 'g1', direction: 'right' } });
		api.addPanel({ id: 'g3', component: 'box', params: { label: 'Grid 3' }, position: { referencePanel: 'g2', direction: 'below' } });
	}

	function splitReady({ api }: SplitviewReadyEvent) {
		api.addPanel({ id: 's1', component: 'box', params: { label: 'Split 1' } });
		api.addPanel({ id: 's2', component: 'box', params: { label: 'Split 2' } });
		api.addPanel({ id: 's3', component: 'other' });
	}

	function paneReady({ api }: PaneviewReadyEvent) {
		api.addPanel({ id: 'p1', component: 'box', title: 'First pane', params: { label: 'Pane 1' } });
		api.addPanel({ id: 'p2', component: 'box', title: 'Second pane', params: { label: 'Pane 2' } });
		api.addPanel({ id: 'p3', component: 'box', title: 'Custom header', headerComponent: 'fancy', params: { label: 'Pane 3' } });
	}
</script>

<div class="grid">
	<section>
		<h2>GridviewSvelte</h2>
		<div class="host"><GridviewSvelte {components} onready={gridReady} orientation={Orientation.HORIZONTAL} /></div>
	</section>
	<section>
		<h2>SplitviewSvelte</h2>
		<div class="host">
			<SplitviewSvelte {components} onready={splitReady} orientation={Orientation.VERTICAL}>
				{#snippet panel({ name })}
					<div class="fallback">snippet for “{name}”</div>
				{/snippet}
			</SplitviewSvelte>
		</div>
	</section>
	<section>
		<h2>PaneviewSvelte</h2>
		<div class="host">
			<PaneviewSvelte {components} onready={paneReady}>
				{#snippet header({ title, api })}
					<button class="pane-header" onclick={() => api.setExpanded(!api.isExpanded)}>★ {title}</button>
				{/snippet}
			</PaneviewSvelte>
		</div>
	</section>
</div>

<style>
	.grid {
		flex: 1;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 12px;
		padding: 12px;
		min-height: 0;
	}
	section {
		display: flex;
		flex-direction: column;
		min-height: 320px;
	}
	h2 {
		font-size: 13px;
		margin: 0 0 6px;
	}
	.host {
		flex: 1;
		border: 1px solid #262a35;
	}
	.fallback {
		padding: 8px;
		color: #9ca3af;
	}
	.pane-header {
		width: 100%;
		height: 100%;
		text-align: left;
		background: #1f2433;
		color: #fbbf24;
		border: none;
		font: inherit;
		cursor: pointer;
	}
</style>
