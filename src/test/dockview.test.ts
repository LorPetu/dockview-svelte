import { render } from '@testing-library/svelte';
import { createRawSnippet, flushSync } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import type { DockviewApi } from 'dockview';
import DrawerHarness from './DrawerHarness.svelte';
import HeaderCount from './HeaderCount.svelte';
import Probe from './Probe.svelte';
import DockviewDefaultTab from '../lib/dockview/DockviewDefaultTab.svelte';
import DockviewSvelte from '../lib/dockview/DockviewSvelte.svelte';

function renderDockview(props: Record<string, unknown> = {}) {
	let api: DockviewApi | undefined;
	const result = render(DockviewSvelte, {
		props: {
			components: { probe: Probe },
			onready: ({ api: ready }: { api: DockviewApi }) => (api = ready),
			...props
		}
	});
	flushSync();
	if (!api) throw new Error('onready was not called');
	return { ...result, api };
}

describe('DockviewSvelte', () => {
	it('renders registered components as panels', () => {
		const { api, container } = renderDockview();
		api.addPanel({ id: 'a', component: 'probe', title: 'A', params: { label: 'panel a' } });
		flushSync();
		expect(container.textContent).toContain('panel a');
		expect(api.panels.map((panel) => panel.id)).toEqual(['a']);
	});

	it('pushes parameter updates into the panel', () => {
		const { api, container } = renderDockview();
		const panel = api.addPanel({ id: 'a', component: 'probe', params: { label: 'before' } });
		flushSync();
		panel.api.updateParameters({ label: 'after' });
		flushSync();
		expect(container.textContent).toContain('after');
	});

	it('falls back to the panel snippet for unknown names', () => {
		const panel = createRawSnippet((props: () => { name: string }) => ({
			render: () => `<p>snippet for ${props().name}</p>`
		}));
		const { api, container } = renderDockview({ panel });
		api.addPanel({ id: 'x', component: 'unregistered' });
		flushSync();
		expect(container.textContent).toContain('snippet for unregistered');
	});

	it('throws a clear error when nothing can render a panel', () => {
		const { api } = renderDockview();
		expect(() => api.addPanel({ id: 'x', component: 'missing' })).toThrow(/no component registered for 'missing'/);
	});

	it('forwards prop changes to updateOptions, only for changed keys', async () => {
		const { api, rerender } = renderDockview({ disableFloatingGroups: false });
		const updateOptions = vi.spyOn(api, 'updateOptions');

		await rerender({ disableFloatingGroups: true });
		flushSync();

		expect(updateOptions).toHaveBeenCalledWith({ disableFloatingGroups: true });
	});

	it('renders the watermark snippet when empty', () => {
		const watermark = createRawSnippet(() => ({ render: () => '<p>nothing here</p>' }));
		const { container } = renderDockview({ watermark });
		expect(container.textContent).toContain('nothing here');
	});

	it('uses DockviewDefaultTab as the default tab, with a working close button', () => {
		const { api, container } = renderDockview({ defaultTabComponent: DockviewDefaultTab });
		api.addPanel({ id: 'a', component: 'probe', title: 'Tab title' });
		flushSync();
		const tab = container.querySelector('[data-testid="dockview-dv-default-tab"]');
		expect(tab?.textContent).toContain('Tab title');

		api.getPanel('a')?.api.setTitle('Renamed');
		flushSync();
		expect(tab?.textContent).toContain('Renamed');

		tab?.querySelector('button')?.click();
		flushSync();
		expect(api.getPanel('a')).toBeUndefined();
	});

	it('renders header actions with live group props', () => {
		const { api, container } = renderDockview({ rightHeaderActionsComponent: HeaderCount });
		api.addPanel({ id: 'a', component: 'probe' });
		flushSync();
		expect(container.querySelector('.count')?.textContent).toBe('1');

		// Same group: the existing actions part receives the new panel list.
		api.addPanel({ id: 'b', component: 'probe', position: { referencePanel: 'a', direction: 'within' } });
		flushSync();
		expect(container.querySelector('.count')?.textContent).toBe('2');
	});

	it('disposes the layout on unmount', () => {
		const { api, unmount } = renderDockview();
		const dispose = vi.spyOn(api, 'dispose');
		unmount();
		expect(dispose).toHaveBeenCalled();
	});
});

describe('DockviewDrawer', () => {
	function renderDrawer(props: Record<string, unknown> = {}) {
		let api: DockviewApi | undefined;
		const collapsedValues: boolean[] = [];
		const result = render(DrawerHarness, {
			props: {
				onready: ({ api: ready }: { api: DockviewApi }) => (api = ready),
				oncollapsed: (value: boolean) => collapsedValues.push(value),
				...props
			}
		});
		flushSync();
		if (!api) throw new Error('onready was not called');
		return { ...result, api, collapsedValues };
	}

	it('creates a left edge group with vertical tabs and its panels', () => {
		const { api, container } = renderDrawer();
		const edge = api.getEdgeGroup('left');
		expect(edge).toBeDefined();
		expect(api.getPanel('tools')?.api.location).toEqual({ type: 'edge', position: 'left' });
		const group = api.groups.find((candidate) => candidate.api === edge);
		expect(group?.model.headerPosition).toBe('left');
		expect(container.textContent).toContain('in drawer');
	});

	it('collapses and expands from the bound prop', async () => {
		const { api, rerender } = renderDrawer();
		expect(api.getEdgeGroup('left')?.isCollapsed()).toBe(false);

		await rerender({ collapsed: true });
		flushSync();
		expect(api.getEdgeGroup('left')?.isCollapsed()).toBe(true);

		await rerender({ collapsed: false });
		flushSync();
		expect(api.getEdgeGroup('left')?.isCollapsed()).toBe(false);
	});

	it('reports collapses made through dockview back to the binding', () => {
		const { api, collapsedValues } = renderDrawer();
		api.getEdgeGroup('left')?.collapse();
		flushSync();
		expect(collapsedValues.at(-1)).toBe(true);
	});

	it('starts collapsed when asked to', () => {
		const { api } = renderDrawer({ collapsed: true });
		expect(api.getEdgeGroup('left')?.isCollapsed()).toBe(true);
	});

	it('adopts an edge group restored by fromJSON instead of re-adding panels', () => {
		const { api } = renderDrawer();
		api.getPanel('tools')?.api.close();
		flushSync();
		const saved = api.toJSON();

		api.fromJSON(saved);
		flushSync();

		expect(api.getEdgeGroup('left')).toBeDefined();
		// The user closed it; restoring must not bring it back.
		expect(api.getPanel('tools')).toBeUndefined();
	});

	it('removes its edge group when destroyed', async () => {
		const { api, rerender } = renderDrawer();
		await rerender({ showDrawer: false });
		flushSync();
		expect(api.getEdgeGroup('left')).toBeUndefined();
		expect(api.getPanel('tools')).toBeUndefined();
	});
});
