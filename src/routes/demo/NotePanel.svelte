<!-- Demo panel: shows reactive panel state, live params and a context value from the page. -->
<script lang="ts">
	import { getContext } from 'svelte';
	import { ReactivePanel, type IDockviewPanelProps } from '#lib';

	let { api, params }: IDockviewPanelProps<{ text?: string }> = $props();

	const panel = $derived(new ReactivePanel(api));
	// Set by the demo page; reaches the panel because parts inherit their host's contexts.
	const appName = getContext<string>('demo:app-name');
</script>

<div class="note" data-testid="note-{api.id}">
	<h3>{panel.title}</h3>
	<p class="text">{params.text ?? 'Empty note'}</p>
	<dl>
		<dt>active</dt>
		<dd data-testid="active">{panel.isActive}</dd>
		<dt>visible</dt>
		<dd>{panel.isVisible}</dd>
		<dt>location</dt>
		<dd>{panel.location.type}</dd>
		<dt>size</dt>
		<dd>{Math.round(panel.width)} × {Math.round(panel.height)}</dd>
		<dt>context</dt>
		<dd data-testid="context">{appName}</dd>
	</dl>
	<div class="actions">
		<button onclick={() => api.setTitle(`${panel.title}!`)}>Rename</button>
		<button onclick={() => api.updateParameters({ text: `Edited at ${new Date().toLocaleTimeString()}` })}>
			Edit params
		</button>
	</div>
</div>

<style>
	.note {
		padding: 12px 16px;
		height: 100%;
		box-sizing: border-box;
		overflow: auto;
	}
	h3 {
		margin: 0 0 6px;
	}
	.text {
		color: #9ca3af;
	}
	dl {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 2px 12px;
		margin: 10px 0;
		font-family: ui-monospace, monospace;
		font-size: 12px;
	}
	dt {
		color: #6b7280;
	}
	dd {
		margin: 0;
	}
	.actions {
		display: flex;
		gap: 6px;
	}
</style>
