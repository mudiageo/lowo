<script lang="ts">
	import './layout.css';
	import { onMount } from 'svelte';
	import { pwaStore } from '$lib/stores/pwa.svelte';
	import { ModeWatcher } from "mode-watcher";

	let { children } = $props();

	onMount(() => {
		pwaStore.init();
	});
</script>

<ModeWatcher />

<svelte:head>
	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
	<title>Lowo — Your Budget, Your Control</title>
</svelte:head>

{@render children()}
