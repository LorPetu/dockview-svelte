import { mount, unmount, untrack } from 'svelte';
import type { IFrameworkPart } from 'dockview';
import SnippetHost from './SnippetHost.svelte';
import type { Renderable } from './renderable';

/** Contexts forwarded into every part, so panels see their host's `getContext()` values. */
export type PartContext = Map<unknown, unknown>;

/**
 * Creates the element dockview attaches for a part. Every wrapper part uses the
 * same class so consumers can target them with one selector.
 */
export function createPartElement(display: 'block' | 'inline-flex' = 'block'): HTMLElement {
	const element = document.createElement('div');
	element.className = 'dv-svelte-part';
	if (display === 'block') {
		element.style.height = '100%';
		element.style.width = '100%';
	} else {
		element.style.display = display;
	}
	return element;
}

/**
 * A live, read-only view over `read()`: every property access goes through the
 * getter, so reading a prop inside a component or snippet tracks the signal
 * behind it. Keys can be added later, unlike an object of fixed getters.
 */
function liveView<T extends object>(read: () => T): T {
	return new Proxy({} as T, {
		get: (_, key) => Reflect.get(read(), key),
		has: (_, key) => Reflect.has(read(), key),
		ownKeys: () => Reflect.ownKeys(read()),
		getOwnPropertyDescriptor: (_, key) => {
			const source = read();
			if (!Reflect.has(source, key)) return undefined;
			return { enumerable: true, configurable: true, value: Reflect.get(source, key) };
		}
	});
}

function shallowEqual(a: object, b: object): boolean {
	const aKeys = Object.keys(a);
	if (aKeys.length !== Object.keys(b).length) return false;
	return aKeys.every((key) => Object.is(Reflect.get(a, key), Reflect.get(b, key)));
}

/**
 * The Svelte counterpart of dockview-react's `ReactPart`: mounts a component or
 * snippet into a dockview-owned element and keeps its props in sync.
 *
 * React needs a portal store and a forced-render bridge to do this. Svelte can
 * `mount()` straight into the element, and props stay reactive because they are
 * read through `liveView` from a `$state.raw` field; `update()` swaps that field.
 * The element can then move anywhere dockview puts it (another group, a floating
 * overlay, a popout window) without remounting.
 */
export class SveltePart<Props extends Record<string, any>> implements IFrameworkPart {
	#props = $state.raw<Props>() as Props;
	#instance: Record<string, unknown> | undefined;
	#disposed = false;

	constructor(target: HTMLElement, renderable: Renderable<Props>, props: Props, context?: PartContext) {
		this.#props = props;
		const view = liveView(() => this.#props);

		// Dockview often creates parts while user code is inside an effect (e.g. an
		// `addPanel` call). Mounting untracked keeps that effect from depending on
		// whatever the new part reads during its first render.
		this.#instance = untrack(() =>
			renderable.kind === 'component'
				? mount(renderable.component, { target, props: view, context })
				: mount(SnippetHost<Props>, {
						target,
						props: { snippet: renderable.snippet, props: view },
						context
					})
		);
	}

	/** Shallow-merges `props` into the current props; a no-op when nothing changed. */
	update(props: Partial<Props> | Record<string, unknown>): void {
		if (this.#disposed) {
			throw new Error('dockview-svelte: cannot update a disposed part');
		}
		const next = { ...this.#props, ...props } as Props;
		// Dockview re-sends unchanged params on every layout pass; skipping those
		// keeps resizes from re-rendering every prop consumer.
		if (!shallowEqual(this.#props, next)) {
			this.#props = next;
		}
	}

	dispose(): void {
		if (this.#disposed) return;
		this.#disposed = true;
		if (this.#instance) {
			void unmount(this.#instance);
			this.#instance = undefined;
		}
	}
}
