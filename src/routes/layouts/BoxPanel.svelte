<script lang="ts">
	let { params }: { params: { label?: string } } = $props();
</script>

<div class="box">{params.label ?? 'box'}</div>

<style>
	.box {
		display: grid;
		place-items: center;
		height: 100%;
		color: #d1d5db;
		background: #171b26;
	}
</style>
