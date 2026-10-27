import type { Component, Snippet } from 'svelte';

/**
 * A component rendered by a dockview part; it receives `Props`. The type also
 * accepts any other component: Svelte types a component without props (or with
 * props TypeScript sees as unrelated) in a way that is not assignable to
 * `Component<Props>`, whereas React's `FunctionComponent<Props>` accepts such
 * components. Type your component's props as `Props` to get checking inside it.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PartComponent<Props extends Record<string, any>> = Component<Props> | Component<any>;

/**
 * Something a dockview part can render: a Svelte component, or a snippet that
 * receives the part's props as its single argument.
 *
 * Components and snippets are both plain functions at runtime, so the kind is
 * recorded explicitly instead of being guessed.
 */
export type Renderable<Props extends Record<string, any>> =
	| { readonly kind: 'component'; readonly component: PartComponent<Props> }
	| { readonly kind: 'snippet'; readonly snippet: Snippet<[Props]> };

export function componentRenderable<Props extends Record<string, any>>(
	component: PartComponent<Props>
): Renderable<Props> {
	return { kind: 'component', component };
}

export function snippetRenderable<Props extends Record<string, any>>(
	snippet: Snippet<[Props]>
): Renderable<Props> {
	return { kind: 'snippet', snippet };
}

/**
 * Resolves the `xComponent` / `x` prop pair used throughout the wrappers: a
 * component wins over a snippet when both are given.
 */
export function pickRenderable<Props extends Record<string, any>>(
	component: PartComponent<Props> | undefined,
	snippet: Snippet<[Props]> | undefined
): Renderable<Props> | undefined {
	if (component) return componentRenderable(component);
	if (snippet) return snippetRenderable(snippet);
	return undefined;
}

/**
 * Looks up a registered name: the component in `components`, else the
 * catch-all snippet, which also receives the name as a `name` prop.
 */
export function resolveNamed<Props extends Record<string, any>>(
	name: string,
	components: Record<string, PartComponent<Props>> | undefined,
	fallback: Snippet<[Props & { name: string }]> | undefined
): { renderable: Renderable<Props>; extraProps: Record<string, unknown> } | undefined {
	const component = components?.[name];
	if (component) return { renderable: componentRenderable(component), extraProps: {} };
	if (fallback) {
		return {
			renderable: snippetRenderable(fallback as unknown as Snippet<[Props]>),
			extraProps: { name }
		};
	}
	return undefined;
}

export function missingRenderer(name: string, propName: string, snippetName: string): Error {
	return new Error(
		`dockview-svelte: no component registered for '${name}'; add it to \`${propName}\` or provide a \`${snippetName}\` snippet`
	);
}
