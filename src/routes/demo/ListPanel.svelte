<!-- Demo drawer panel: a simple list whose items open note panels in the main area. -->
<script lang="ts">
	import { getDockviewContext, type IDockviewPanelProps } from '#lib';

	let { params }: IDockviewPanelProps<{ items?: string[] }> = $props();

	// The same handle `<DockviewSvelte>` exposes to its children reaches panels too.
	const dock = getDockviewContext();

	function open(item: string) {
		const api = dock.current;
		if (!api) return;
		const id = `note-${item.toLowerCase().replace(/\W+/g, '-')}`;
		const existing = api.getPanel(id);
		if (existing) {
			existing.api.setActive();
			return;
		}
		const target = api.groups.find((group) => group.api.location.type === 'grid');
		api.addPanel({
			id,
			component: 'note',
			title: item,
			params: { text: `Opened from the drawer: ${item}` },
			position: target ? { referenceGroup: target } : undefined
		});
	}
</script>

<ul>
	{#each params.items ?? [] as item (item)}
		<li><button onclick={() => open(item)}>{item}</button></li>
	{/each}
</ul>

<style>
	ul {
		list-style: none;
		margin: 0;
		padding: 8px;
	}
	button {
		width: 100%;
		text-align: left;
		background: none;
		border: none;
		color: inherit;
		padding: 5px 8px;
		border-radius: 4px;
		cursor: pointer;
		font: inherit;
	}
	button:hover {
		background: rgba(255, 255, 255, 0.07);
	}
</style>
