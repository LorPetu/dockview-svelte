<script lang="ts">
	import { setContext } from 'svelte';
	import {
		DockviewDrawer,
		DockviewSvelte,
		ReactiveDockview,
		themeAbyss,
		themeLight,
		type DockviewApi,
		type DockviewReadyEvent
	} from '#lib';
	import ListPanel from './demo/ListPanel.svelte';
	import NotePanel from './demo/NotePanel.svelte';

	const STORAGE_KEY = 'dockview-svelte:demo-layout:v1';

	// Read by NotePanel through getContext: parts inherit the page's contexts.
	setContext('demo:app-name', 'dockview-svelte demo');

	const components = { note: NotePanel, list: ListPanel };

	let api = $state<DockviewApi>();
	let dark = $state(true);
	let leftCollapsed = $state(false);
	let rightCollapsed = $state(true);
	let noteCount = 0;

	const dock = $derived(api ? new ReactiveDockview(api) : undefined);

	function onready({ api }: DockviewReadyEvent) {
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				api.fromJSON(JSON.parse(saved));
				return;
			}
		} catch {
			// unreadable storage or a stale layout: start fresh
			api.clear();
		}
		buildDefault(api);
	}

	function buildDefault(api: DockviewApi) {
		api.addPanel({
			id: 'welcome',
			component: 'note',
			title: 'Welcome',
			params: { text: 'Drag tabs to split, or into the side drawers. Click a drawer tab to minimize it.' }
		});
		api.addPanel({
			id: 'details',
			component: 'note',
			title: 'Details',
			params: { text: 'Panels are plain Svelte components.' },
			position: { referencePanel: 'welcome', direction: 'right' }
		});
		api.addPanel({
			id: 'inline',
			component: 'inline',
			title: 'Snippet panel',
			position: { referencePanel: 'details', direction: 'below' }
		});
	}

	function addNote() {
		noteCount += 1;
		api?.addPanel({
			id: `note-${Date.now()}`,
			component: 'note',
			title: `Note ${noteCount}`,
			params: { text: 'A new note' }
		});
	}

	function resetLayout() {
		if (!api) return;
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch {
			// nothing to clear
		}
		location.reload();
	}

	// Persist every layout change; `dock.layout` re-reads on onDidLayoutChange.
	$effect(() => {
		if (!dock) return;
		const layout = dock.layout;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
		} catch {
			// storage unavailable: layout just won't persist
		}
	});
</script>

<div class="toolbar">
	<button onclick={addNote}>+ Note</button>
	<button onclick={() => (leftCollapsed = !leftCollapsed)} data-testid="toggle-left">
		{leftCollapsed ? 'Open' : 'Minimize'} left drawer
	</button>
	<button onclick={() => (rightCollapsed = !rightCollapsed)} data-testid="toggle-right">
		{rightCollapsed ? 'Open' : 'Minimize'} right drawer
	</button>
	<button onclick={() => (dark = !dark)}>{dark ? 'Light' : 'Dark'} theme</button>
	<button onclick={resetLayout}>Reset layout</button>
	<span class="status" data-testid="status">
		{dock?.panels.length ?? 0} panels · active: {dock?.activePanel?.title ?? 'none'}
	</span>
</div>

<div class="dock" class:light={!dark}>
	<DockviewSvelte
		bind:api
		{components}
		{onready}
		theme={dark ? themeAbyss : themeLight}
		getTabContextMenuItems={() => ['close', 'closeOthers', 'separator', 'maximize', 'float', 'popout']}
	>
		{#snippet panel({ name, api })}
			<div class="snippet-panel">
				Rendered by the <code>panel</code> snippet: no component is registered as
				<code>{name}</code> (panel <code>{api.id}</code>).
			</div>
		{/snippet}

		{#snippet watermark()}
			<div class="watermark">No panels open. Use “+ Note” or the Explorer drawer.</div>
		{/snippet}

		{#snippet rightHeaderActions({ api, location })}
			{#if location?.type === 'grid'}
				<button
					class="header-action"
					title={dock?.hasMaximizedGroup ? 'Restore' : 'Maximize'}
					onclick={() => (api.isMaximized() ? api.exitMaximized() : api.maximize())}
				>
					{dock?.hasMaximizedGroup ? '🗗' : '🗖'}
				</button>
			{/if}
		{/snippet}

		<DockviewDrawer
			side="left"
			size={220}
			bind:collapsed={leftCollapsed}
			panels={[
				{
					id: 'explorer',
					component: 'list',
					title: 'Explorer',
					params: { items: ['Getting started', 'Drawers', 'Snippets', 'Reactive state'] }
				},
				{
					id: 'outline',
					component: 'list',
					title: 'Outline',
					params: { items: ['Overview', 'API'] },
					inactive: true
				}
			]}
		/>
		<DockviewDrawer
			side="right"
			size={260}
			bind:collapsed={rightCollapsed}
			panels={[
				{
					id: 'inspector',
					component: 'note',
					title: 'Inspector',
					params: { text: 'A note docked in the right drawer.' }
				}
			]}
		/>
	</DockviewSvelte>
</div>

<style>
	.toolbar {
		display: flex;
		gap: 8px;
		align-items: center;
		padding: 6px 12px;
		border-bottom: 1px solid #262a35;
	}
	.status {
		margin-left: auto;
		color: #9ca3af;
		font-family: ui-monospace, monospace;
	}
	.dock {
		flex: 1;
		min-height: 0;
	}
	.dock.light {
		background: #fff;
		color: #111827;
	}
	.snippet-panel,
	.watermark {
		padding: 16px;
		color: #9ca3af;
	}
	.watermark {
		display: grid;
		place-items: center;
		height: 100%;
	}
	.header-action {
		background: none;
		border: none;
		color: inherit;
		cursor: pointer;
		padding: 0 8px;
		height: 100%;
	}
</style>
