<!--
  Mount target for snippet renderables: `mount()` only accepts components, so
  snippets are rendered through this one-line host. `props` is the part's live
  props view, so the snippet re-renders when the part is updated.
-->
<script lang="ts" generics="Props extends Record<string, any>">
	import type { Snippet } from 'svelte';

	let { snippet, props }: { snippet: Snippet<[Props]>; props: Props } = $props();
</script>

{@render snippet(props)}
