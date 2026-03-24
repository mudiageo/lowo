<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Zap from '@lucide/svelte/icons/zap';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import Wallet from '@lucide/svelte/icons/wallet';
	import { appStore } from '$lib/stores/app.svelte';

	const getStartedLink = $derived(
		appStore.settings?.hasCompletedOnboarding ? '/dashboard' : '/onboarding'
	);
</script>

<svelte:head>
	<title>Lowo — Your Budget, Your Control</title>
	<meta name="description" content="Local-first personal budget planner for Nigeria. Track expenses, set savings goals, and get AI insights — all on your device." />
</svelte:head>

<div class="min-h-screen bg-background text-foreground selection:bg-primary/30">
	<!-- Navigation -->
	<header
		class="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
	>
		<div class="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
			<div class="flex items-center space-x-2">
				<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
					<Wallet class="h-5 w-5 text-primary-foreground" />
				</div>
				<span class="font-heading text-xl font-bold tracking-tight text-foreground">Lowo.</span>
			</div>
			<nav class="mr-6 hidden gap-6 text-sm font-medium text-muted-foreground md:flex">
				<a href="#features" class="transition-colors hover:text-primary">Features</a>
				<a href="#privacy" class="transition-colors hover:text-primary">Privacy</a>
			</nav>
			<div class="flex items-center gap-4">
				<Button href={getStartedLink} size="sm" class="rounded-full px-6">
					{appStore.settings?.hasCompletedOnboarding ? 'Go to Dashboard' : 'Start Planning'}
				</Button>
			</div>
		</div>
	</header>

	<main>
		<!-- Hero Section -->
		<section class="relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32">
			<!-- Decorative background blur -->
			<div
				class="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]"
			></div>

			<div class="container mx-auto max-w-6xl px-4 text-center">
				<div
					class="mb-8 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
				>
					<Sparkles class="mr-2 h-4 w-4" />
					<span>Local-first PWA for Nigeria</span>
				</div>

				<h1
					class="mb-6 font-heading text-5xl font-extrabold tracking-tight text-balance md:text-7xl"
				>
					Your money, your rules, <br class="hidden md:block" />
					<span class="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent"
						>all on your device.</span
					>
				</h1>

				<p
					class="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-balance text-muted-foreground md:text-2xl"
				>
					Lowo is a premium personal budget planner built for absolute privacy. No cloud databases,
					zero latency, just your exact financial streams.
				</p>

				<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Button
						href={getStartedLink}
						size="lg"
						class="text-md h-14 rounded-full bg-primary px-8 text-primary-foreground hover:bg-primary/90"
					>
						{appStore.settings?.hasCompletedOnboarding ? 'Open Dashboard' : 'Get Started Now'}
						<ArrowRight class="ml-2 h-5 w-5" />
					</Button>
					<Button
						href="https://github.com/mudiageo/lowo"
						variant="outline"
						size="lg"
						class="text-md h-14 rounded-full px-8"
						target="_blank"
					>
						View Source Code
					</Button>
				</div>
			</div>
		</section>

		<!-- Features Section -->
		<section id="features" class="border-y border-border bg-card py-24">
			<div class="container mx-auto max-w-6xl px-4">
				<div class="mb-16 text-center">
					<h2 class="mb-4 font-heading text-3xl font-bold tracking-tight md:text-4xl">
						Designed for the modern reality
					</h2>
					<p class="mx-auto max-w-2xl text-lg text-muted-foreground">
						Everything you need to manage your personal finances, engineered to work phenomenally
						even inside a supermarket with a blocked network signal.
					</p>
				</div>

				<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
					<!-- Feature 1 -->
					<div
						class="rounded-2xl border border-border bg-background p-8 shadow-sm transition-shadow hover:shadow-md"
					>
						<div
							class="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
						>
							<Zap class="h-6 w-6" />
						</div>
						<h3 class="mb-3 text-xl font-bold">Offline-First Speed</h3>
						<p class="leading-relaxed text-muted-foreground">
							Runs entirely in your browser using IndexedDB. No waiting for server responses means
							lightning-fast expense logging.
						</p>
					</div>

					<!-- Feature 2 -->
					<div
						class="rounded-2xl border border-border bg-background p-8 shadow-sm transition-shadow hover:shadow-md"
					>
						<div
							class="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500"
						>
							<Sparkles class="h-6 w-6" />
						</div>
						<h3 class="mb-3 text-xl font-bold">Local AI Analytics</h3>
						<p class="leading-relaxed text-muted-foreground">
							Bring your own Google Gemini API key. Lowo analyzes your spending locally, generating
							insights without uploading your complete history to remote servers continuously.
						</p>
					</div>

					<!-- Feature 3 -->
					<div
						class="rounded-2xl border border-border bg-background p-8 shadow-sm transition-shadow hover:shadow-md"
						id="privacy"
					>
						<div
							class="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-green-500"
						>
							<ShieldCheck class="h-6 w-6" />
						</div>
						<h3 class="mb-3 text-xl font-bold">Absolute Privacy</h3>
						<p class="leading-relaxed text-muted-foreground">
							Your data resides solely on your device. Syncing to the cloud is completely optional
							and strictly opt-in.
						</p>
					</div>
				</div>
			</div>
		</section>
	</main>

	<footer class="border-t border-border py-12 text-center text-muted-foreground">
		<div class="container mx-auto flex flex-col items-center justify-between px-4 md:flex-row">
			<div class="mb-4 flex items-center space-x-2 text-foreground md:mb-0">
				<Wallet class="h-5 w-5 text-primary" />
				<span class="font-heading text-lg font-bold tracking-tight">Lowo.</span>
			</div>
			<p class="text-sm">Built with SvelteKit & Tailwind CSS. PWA Ready.</p>
		</div>
	</footer>
</div>
