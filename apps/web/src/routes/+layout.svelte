<script lang="ts">
	import './layout.css';
	import { onMount } from 'svelte';
	import { pwaStore } from '$lib/stores/pwa.svelte';

	let { children } = $props();

	onMount(() => {
		pwaStore.init();
	});
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
	<title>Lowo — Your Budget, Your Control</title>
</svelte:head>

{@render children()}
