import { render } from '@testing-library/svelte';
import { createRawSnippet, flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import { Orientation, type GridviewApi, type PaneviewApi, type SplitviewApi } from 'dockview';
import Probe from './Probe.svelte';
import PaneviewSvelte from '../lib/paneview/PaneviewSvelte.svelte';
import SplitviewSvelte from '../lib/splitview/SplitviewSvelte.svelte';
import GridviewSvelte from '../lib/gridview/GridviewSvelte.svelte';

describe('GridviewSvelte', () => {
	it('renders panels and their params', () => {
		let api: GridviewApi | undefined;
		const { container } = render(GridviewSvelte, {
			props: {
				orientation: Orientation.HORIZONTAL,
				components: { probe: Probe },
				onready: ({ api: ready }) => (api = ready)
			}
		});
		flushSync();
		api!.addPanel({ id: 'g', component: 'probe', params: { label: 'grid panel' } });
		flushSync();
		expect(container.textContent).toContain('grid panel');
	});
});

describe('SplitviewSvelte', () => {
	it('renders panels and the fallback snippet', () => {
		let api: SplitviewApi | undefined;
		const panel = createRawSnippet((props: () => { name: string }) => ({
			render: () => `<p>fallback ${props().name}</p>`
		}));
		const { container } = render(SplitviewSvelte, {
			props: {
				orientation: Orientation.VERTICAL,
				components: { probe: Probe },
				panel,
				onready: ({ api: ready }) => (api = ready)
			}
		});
		flushSync();
		api!.addPanel({ id: 's1', component: 'probe', params: { label: 'split panel' } });
		api!.addPanel({ id: 's2', component: 'other' });
		flushSync();
		expect(container.textContent).toContain('split panel');
		expect(container.textContent).toContain('fallback other');
	});
});

describe('PaneviewSvelte', () => {
	it('renders panes with custom headers', () => {
		let api: PaneviewApi | undefined;
		const header = createRawSnippet((props: () => { title: string }) => ({
			render: () => `<b>header ${props().title}</b>`
		}));
		const { container } = render(PaneviewSvelte, {
			props: {
				components: { probe: Probe },
				header,
				onready: ({ api: ready }) => (api = ready)
			}
		});
		flushSync();
		api!.addPanel({
			id: 'p',
			component: 'probe',
			headerComponent: 'custom',
			title: 'Pane',
			params: { label: 'pane body' }
		});
		flushSync();
		expect(container.textContent).toContain('header Pane');
		expect(container.textContent).toContain('pane body');
	});
});
