/**
 * Copies the core option keys present on `props`. Reading through `props`
 * (a `$props()` object) inside an effect tracks exactly those keys.
 */
export function pickOptions<Options extends object>(
	props: object,
	keys: readonly (keyof Options)[]
): Partial<Options> {
	const picked: Partial<Options> = {};
	for (const key of keys) {
		if (key in props) {
			picked[key] = Reflect.get(props, key) as Options[typeof key];
		}
	}
	return picked;
}

/** The entries of `next` that differ from `previous`, or undefined when none do. */
export function diffOptions<Options extends object>(
	previous: Partial<Options>,
	next: Partial<Options>
): Partial<Options> | undefined {
	const changes: Partial<Options> = {};
	let changed = false;
	for (const key of Object.keys(next) as (keyof Options)[]) {
		if (!Object.is(previous[key], next[key])) {
			changes[key] = next[key];
			changed = true;
		}
	}
	// A key that disappeared reverts to the core default.
	for (const key of Object.keys(previous) as (keyof Options)[]) {
		if (!(key in next)) {
			changes[key] = undefined;
			changed = true;
		}
	}
	return changed ? changes : undefined;
}
