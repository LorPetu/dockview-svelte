import { getContext, hasContext, setContext } from 'svelte';
import type { DockviewApi } from 'dockview';

/**
 * Reactive handle to a component's api. `current` is undefined until the
 * underlying dockview instance exists (it is created in `onMount`), so readers
 * should use it from an `$effect` or template, where it updates once set.
 */
export class ApiHandle<Api> {
	current = $state.raw<Api | undefined>(undefined);
}

const DOCKVIEW_KEY = Symbol('dockview-svelte:dockview');

export function setDockviewContext(handle: ApiHandle<DockviewApi>): void {
	setContext(DOCKVIEW_KEY, handle);
}

/**
 * The api of the nearest enclosing `<DockviewSvelte>`. Works both in the
 * component's `children` (e.g. `<DockviewDrawer>`) and inside panels, tabs and
 * header actions, because every part is mounted with its host's contexts.
 */
export function getDockviewContext(): ApiHandle<DockviewApi> {
	if (!hasContext(DOCKVIEW_KEY)) {
		throw new Error('dockview-svelte: getDockviewContext() must be called inside <DockviewSvelte>');
	}
	return getContext<ApiHandle<DockviewApi>>(DOCKVIEW_KEY);
}
