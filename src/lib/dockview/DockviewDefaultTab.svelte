<!--
  @component
  The standard tab (title, pin indicator, close button, middle-click to close),
  for use as `defaultTabComponent` or inside a custom tab that adds to it.
  Extra attributes are forwarded to the tab element.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { IDockviewPanelHeaderProps } from 'dockview';
	import { ReactivePanel } from '../reactive/panel';

	type Props = IDockviewPanelHeaderProps &
		HTMLAttributes<HTMLDivElement> & {
			hideClose?: boolean;
			/** Replaces `api.close()` for the close button and middle-click. */
			closeActionOverride?: () => void;
		};

	let {
		api,
		containerApi: _containerApi,
		params: _params,
		tabLocation: _tabLocation,
		hideClose = false,
		closeActionOverride,
		onpointerdown,
		onpointerup,
		onpointerleave,
		...rest
	}: Props = $props();

	const panel = $derived(new ReactivePanel(api));

	let isMiddleButton = false;

	function close(event: Event) {
		event.preventDefault();
		if (closeActionOverride) closeActionOverride();
		else api.close();
	}
</script>

<div
	data-testid="dockview-dv-default-tab"
	{...rest}
	class="dv-default-tab"
	onpointerdown={(event) => {
		isMiddleButton = event.button === 1;
		onpointerdown?.(event);
	}}
	onpointerup={(event) => {
		if (isMiddleButton && event.button === 1 && !hideClose) {
			isMiddleButton = false;
			close(event);
		}
		onpointerup?.(event);
	}}
	onpointerleave={(event) => {
		isMiddleButton = false;
		onpointerleave?.(event);
	}}
>
	{#if panel.isPinned}
		<!-- Core draws this indicator only for its own tabs, so custom tabs add it themselves. -->
		<div class="dv-tab-pin">
			<svg height="11" width="11" viewBox="0 0 24 24" aria-hidden="true" focusable="false" class="dv-svg">
				<path
					d="M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H6c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z"
				/>
			</svg>
		</div>
	{/if}
	<span class="dv-default-tab-content">{panel.title}</span>
	{#if !hideClose}
		<button
			type="button"
			class="dv-default-tab-action"
			aria-label="Close tab"
			onpointerdown={(event) => event.preventDefault()}
			onclick={close}
		>
			<svg height="11" width="11" viewBox="0 0 28 28" aria-hidden="true" focusable="false" class="dv-svg">
				<path
					d="M2.1 27.3L0 25.2L11.55 13.65L0 2.1L2.1 0L13.65 11.55L25.2 0L27.3 2.1L15.75 13.65L27.3 25.2L25.2 27.3L13.65 15.75L2.1 27.3Z"
				/>
			</svg>
		</button>
	{/if}
</div>
