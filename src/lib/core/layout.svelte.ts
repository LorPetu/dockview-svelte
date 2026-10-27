import { onMount, untrack } from 'svelte';
import { ApiHandle } from './context.svelte';
import { diffOptions, pickOptions } from './options';

/** The part of every dockview component api this helper relies on. */
interface LayoutApi<Options> {
	layout(width: number, height: number): void;
	updateOptions(options: Partial<Options>): void;
	dispose(): void;
}

interface LayoutConfig<Api, Options extends object> {
	/** Returns the component's `$props()` object; core options are read from it. */
	props: () => object;
	/** The core option keys (`PROPERTY_KEYS_*`). */
	keys: readonly (keyof Options)[];
	/** The host element, bound with `bind:this`. */
	element: () => HTMLElement;
	/** Creates the instance with the initial core options. */
	create: (element: HTMLElement, options: Partial<Options>) => Api;
	/** Runs once the instance exists and has its first layout (bind the api, call onready). */
	ready: (api: Api) => void;
	/** Runs before the instance is disposed. */
	destroy?: (api: Api) => void;
}

/**
 * Shared lifecycle of every wrapper component, as a rune-based function called
 * during component initialisation:
 *
 * - creates the instance in `onMount` (never during SSR) and lays it out,
 * - pushes changed core options to `updateOptions`,
 * - disposes it on unmount.
 *
 * The returned handle's `current` is set after `ready`, so effects reading it
 * see the layout `ready` produced (e.g. one restored with `fromJSON`).
 */
export function useLayout<Api extends LayoutApi<Options>, Options extends object>(
	config: LayoutConfig<Api, Options>
): ApiHandle<Api> {
	const handle = new ApiHandle<Api>();
	let applied: Partial<Options> = {};

	onMount(() => {
		const element = config.element();
		applied = pickOptions<Options>(config.props(), config.keys);
		const instance = config.create(element, applied);
		instance.layout(element.clientWidth, element.clientHeight);
		config.ready(instance);
		handle.current = instance;

		return () => {
			handle.current = undefined;
			config.destroy?.(instance);
			instance.dispose();
		};
	});

	$effect(() => {
		const next = pickOptions<Options>(config.props(), config.keys);
		const instance = handle.current;
		if (!instance) return;
		untrack(() => {
			const changes = diffOptions(applied, next);
			applied = next;
			if (changes) instance.updateOptions(changes);
		});
	});

	return handle;
}
