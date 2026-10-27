import { createRawSnippet, flushSync } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import Probe from './Probe.svelte';
import { SveltePart } from '../lib/core/part.svelte';
import { componentRenderable, snippetRenderable } from '../lib/core/renderable';

function target() {
	const element = document.createElement('div');
	document.body.append(element);
	return element;
}

describe('SveltePart', () => {
	it('mounts a component with its props', () => {
		const element = target();
		const part = new SveltePart(element, componentRenderable(Probe), { params: { label: 'hello' } });
		flushSync();
		expect(element.textContent).toContain('hello');
		part.dispose();
	});

	it('updates props reactively without remounting', () => {
		const element = target();
		const part = new SveltePart(element, componentRenderable(Probe), { params: { label: 'one' } });
		flushSync();
		const node = element.querySelector('[data-testid="probe"]');

		part.update({ params: { label: 'two' } });
		flushSync();

		expect(element.textContent).toContain('two');
		expect(element.querySelector('[data-testid="probe"]')).toBe(node);
		part.dispose();
	});

	it('skips updates that change nothing', () => {
		const element = target();
		const onrender = vi.fn();
		const params = { label: 'same' };
		const part = new SveltePart(element, componentRenderable(Probe), { params, onrender });
		flushSync();
		expect(onrender).toHaveBeenCalledTimes(1);

		// Dockview re-sends the same params object on every layout pass.
		part.update({ params });
		flushSync();
		expect(onrender).toHaveBeenCalledTimes(1);

		part.update({ params: { label: 'changed' } });
		flushSync();
		expect(onrender).toHaveBeenCalledTimes(2);
		part.dispose();
	});

	it('renders snippets with live props', () => {
		const element = target();
		const snippet = createRawSnippet((props: () => { params: { label: string } }) => ({
			render: () => `<em>${props().params.label}</em>`
		}));
		const part = new SveltePart(element, snippetRenderable(snippet), { params: { label: 'from snippet' } });
		flushSync();
		expect(element.querySelector('em')?.textContent).toBe('from snippet');
		part.dispose();
	});

	it('forwards contexts to the mounted component', () => {
		const element = target();
		const context = new Map([['test:context', 'inherited']]);
		const part = new SveltePart(element, componentRenderable(Probe), { params: {} }, context);
		flushSync();
		expect(element.querySelector('[data-testid="context"]')?.textContent).toBe('inherited');
		part.dispose();
	});

	it('unmounts on dispose and rejects later updates', () => {
		const element = target();
		const part = new SveltePart(element, componentRenderable(Probe), { params: { label: 'bye' } });
		flushSync();
		part.dispose();
		flushSync();
		expect(element.textContent).toBe('');
		expect(() => part.update({ params: {} })).toThrow(/disposed/);
		// Disposing twice is harmless.
		part.dispose();
	});
});
