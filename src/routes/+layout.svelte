<script lang="ts">
	import { page } from '$app/state';

	let { children } = $props();

	const links = [
		{ href: '/', label: 'Dockview + drawers' },
		{ href: '/layouts', label: 'Grid / Split / Pane' }
	];
</script>

<svelte:head>
	<title>dockview-svelte</title>
</svelte:head>

<div class="shell">
	<nav>
		<strong>dockview-svelte</strong>
		{#each links as link (link.href)}
			<a href={link.href} aria-current={page.url.pathname === link.href ? 'page' : undefined}>{link.label}</a>
		{/each}
	</nav>
	<main>
		{@render children()}
	</main>
</div>

<style>
	:global(html, body) {
		margin: 0;
		height: 100%;
		font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
		font-size: 13px;
		background: #0f1117;
		color: #e5e7eb;
	}
	.shell {
		display: flex;
		flex-direction: column;
		height: 100vh;
	}
	nav {
		display: flex;
		gap: 16px;
		align-items: center;
		padding: 8px 14px;
		border-bottom: 1px solid #262a35;
		background: #151821;
	}
	nav a {
		color: #9ca3af;
		text-decoration: none;
	}
	nav a[aria-current='page'] {
		color: #f9fafb;
		text-decoration: underline;
	}
	main {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
	}
</style>
