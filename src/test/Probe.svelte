<!-- Test fixture: renders its params and a context value, and counts renders of `params`. -->
<script lang="ts">
	import { getContext } from 'svelte';

	let {
		params = {},
		onrender
	}: { params?: { label?: string }; onrender?: () => void; [key: string]: unknown } = $props();

	const fromContext = getContext<string | undefined>('test:context');

	$effect(() => {
		void params.label;
		onrender?.();
	});
</script>

<span data-testid="probe">{params.label ?? 'no label'}</span>
{#if fromContext}<span data-testid="context">{fromContext}</span>{/if}
