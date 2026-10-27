import { render } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import type { DockviewApi } from 'dockview';
import Probe from './Probe.svelte';
import DockviewSvelte from '../lib/dockview/DockviewSvelte.svelte';
import { ReactiveDockview } from '../lib/reactive/dockview';
import { ReactiveGroup } from '../lib/reactive/group';
import { ReactivePanel } from '../lib/reactive/panel';

function setup() {
	let api: DockviewApi | undefined;
	render(DockviewSvelte, {
		props: { components: { probe: Probe }, onready: ({ api: ready }) => (api = ready) }
	});
	flushSync();
	if (!api) throw new Error('onready was not called');
	return api;
}

/** Runs `read` in an effect and returns every value it produced. */
function track<T>(read: () => T) {
	const values: T[] = [];
	const stop = $effect.root(() => {
		$effect(() => {
			values.push(read());
		});
	});
	flushSync();
	return { values, stop };
}

describe('reactive helpers', () => {
	it('ReactivePanel follows title and params changes', () => {
		const api = setup();
		const panel = new ReactivePanel(
			api.addPanel({ id: 'a', component: 'probe', title: 'First', params: { label: 'x' } })
		);

		const titles = track(() => panel.title);
		const labels = track(() => panel.params.label);

		panel.api.setTitle('Second');
		panel.api.updateParameters({ label: 'y' });
		flushSync();

		expect(titles.values).toEqual(['First', 'Second']);
		expect(labels.values).toEqual(['x', 'y']);
		titles.stop();
		labels.stop();
	});

	it('ReactiveDockview follows panels and the active panel', () => {
		const api = setup();
		const dock = new ReactiveDockview(api);
		const counts = track(() => dock.panels.length);
		const active = track(() => dock.activePanel?.id);

		api.addPanel({ id: 'a', component: 'probe' });
		api.addPanel({ id: 'b', component: 'probe' });
		flushSync();
		api.getPanel('a')?.api.close();
		flushSync();

		expect(counts.values.at(-1)).toBe(1);
		expect(counts.values).toContain(2);
		expect(active.values.at(-1)).toBe('b');
		counts.stop();
		active.stop();
	});

	it('ReactiveGroup follows collapse of an edge group', () => {
		const api = setup();
		api.addEdgeGroup('right', { id: 'edge-right', initialSize: 200 });
		const group = api.groups.find((candidate) => candidate.api === api.getEdgeGroup('right'));
		if (!group) throw new Error('edge group missing');
		api.addPanel({ id: 'a', component: 'probe', position: { referenceGroup: group } });
		flushSync();

		const reactive = new ReactiveGroup(group);
		const collapsed = track(() => reactive.isCollapsed);
		reactive.toggle();
		flushSync();
		reactive.toggle();
		flushSync();

		expect(collapsed.values).toEqual([false, true, false]);
		expect(reactive.headerPosition).toBe('right');
		collapsed.stop();
	});

	it('ReactiveDockview.layout updates when a drawer collapses', () => {
		const api = setup();
		api.addEdgeGroup('left', { id: 'edge-left', initialSize: 200 });
		const group = api.groups.find((candidate) => candidate.api === api.getEdgeGroup('left'));
		if (!group) throw new Error('edge group missing');
		api.addPanel({ id: 'a', component: 'probe', position: { referenceGroup: group } });
		flushSync();

		const dock = new ReactiveDockview(api);
		const collapsed = track(() => dock.layout.edgeGroups?.left?.collapsed ?? false);
		group.api.collapse();
		flushSync();

		expect(collapsed.values).toEqual([false, true]);
		collapsed.stop();
	});

	it('stops listening when nothing reads', () => {
		const api = setup();
		const panel = new ReactivePanel(api.addPanel({ id: 'a', component: 'probe', title: 'T' }).api);
		const titles = track(() => panel.title);
		titles.stop();

		panel.api.setTitle('ignored');
		flushSync();
		expect(titles.values).toEqual(['T']);
	});
});
