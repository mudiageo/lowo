<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import ShieldCheck from "@lucide/svelte/icons/shield-check";
  import Zap from "@lucide/svelte/icons/zap";
  import Sparkles from "@lucide/svelte/icons/sparkles";
  import Wallet from "@lucide/svelte/icons/wallet";
  import { appStore } from "$lib/stores/app.svelte";

  const getStartedLink = $derived(
    appStore.settings?.hasCompletedOnboarding ? "/dashboard" : "/onboarding"
  );
</script>

<div class="min-h-screen bg-background text-foreground selection:bg-primary/30">
  <!-- Navigation -->
  <header class="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="container mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Wallet class="w-5 h-5 text-primary-foreground" />
        </div>
        <span class="font-heading font-bold text-xl tracking-tight text-foreground">Lowo.</span>
      </div>
      <nav class="hidden md:flex gap-6 text-sm font-medium text-muted-foreground mr-6">
        <a href="#features" class="hover:text-primary transition-colors">Features</a>
        <a href="#privacy" class="hover:text-primary transition-colors">Privacy</a>
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
    <section class="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      <!-- Decorative background blur -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <div class="container mx-auto max-w-6xl px-4 text-center">
        <div class="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20">
          <Sparkles class="w-4 h-4 mr-2" />
          <span>Local-first PWA for Nigeria</span>
        </div>
        
        <h1 class="text-5xl md:text-7xl font-heading font-extrabold tracking-tight text-balance mb-6">
          Your money, your rules, <br class="hidden md:block" />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">all on your device.</span>
        </h1>
        
        <p class="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 text-balance leading-relaxed">
          Lowo is a premium personal budget planner built for absolute privacy. No cloud databases, zero latency, just your exact financial streams.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button href={getStartedLink} size="lg" class="rounded-full px-8 text-md h-14 bg-primary text-primary-foreground hover:bg-primary/90">
            {appStore.settings?.hasCompletedOnboarding ? 'Open Dashboard' : 'Get Started Now'} 
            <ArrowRight class="ml-2 w-5 h-5" />
          </Button>
          <Button href="https://github.com/your-username/lowo" variant="outline" size="lg" class="rounded-full px-8 text-md h-14" target="_blank">
            View Source Code
          </Button>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-24 bg-card border-y border-border">
      <div class="container mx-auto max-w-6xl px-4">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-heading font-bold tracking-tight mb-4">Designed for the modern reality</h2>
          <p class="text-muted-foreground text-lg max-w-2xl mx-auto">Everything you need to manage your personal finances, engineered to work phenomenally even inside a supermarket with a blocked network signal.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="p-8 rounded-2xl bg-background border border-border shadow-sm hover:shadow-md transition-shadow">
            <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
              <Zap class="w-6 h-6" />
            </div>
            <h3 class="text-xl font-bold mb-3">Offline-First Speed</h3>
            <p class="text-muted-foreground leading-relaxed">Runs entirely in your browser using IndexedDB. No waiting for server responses means lightning-fast expense logging.</p>
          </div>

          <!-- Feature 2 -->
          <div class="p-8 rounded-2xl bg-background border border-border shadow-sm hover:shadow-md transition-shadow">
            <div class="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6">
              <Sparkles class="w-6 h-6" />
            </div>
            <h3 class="text-xl font-bold mb-3">Local AI Analytics</h3>
            <p class="text-muted-foreground leading-relaxed">Bring your own Google Gemini API key. Lowo analyzes your spending locally, generating insights without uploading your complete history to remote servers continuously.</p>
          </div>

          <!-- Feature 3 -->
          <div class="p-8 rounded-2xl bg-background border border-border shadow-sm hover:shadow-md transition-shadow" id="privacy">
            <div class="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 mb-6">
              <ShieldCheck class="w-6 h-6" />
            </div>
            <h3 class="text-xl font-bold mb-3">Absolute Privacy</h3>
            <p class="text-muted-foreground leading-relaxed">Your data resides solely on your device. Syncing to the cloud is completely optional and strictly opt-in.</p>
          </div>
        </div>
      </div>
    </section>

  </main>

  <footer class="border-t border-border py-12 text-center text-muted-foreground">
    <div class="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
      <div class="flex items-center space-x-2 text-foreground mb-4 md:mb-0">
        <Wallet class="w-5 h-5 text-primary" />
        <span class="font-heading font-bold text-lg tracking-tight">Lowo.</span>
      </div>
      <p class="text-sm">
        Built with SvelteKit & Tailwind CSS. PWA Ready.
      </p>
    </div>
  </footer>
</div>
