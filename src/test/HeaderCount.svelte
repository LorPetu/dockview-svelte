<!-- Test fixture: header actions that show the group's live panel count. -->
<script lang="ts">
	import type { IDockviewHeaderActionsProps } from 'dockview';

	let { panels }: IDockviewHeaderActionsProps = $props();
</script>

<span class="count">{panels.length}</span>
