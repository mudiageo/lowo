<script lang="ts">
  import DesktopSidebar from "$lib/components/layout/DesktopSidebar.svelte";
  import BottomNav from "$lib/components/layout/BottomNav.svelte";
  import CommandPalette from "$lib/components/layout/CommandPalette.svelte";
  import QuickAddModal from "$lib/components/layout/QuickAddModal.svelte";
  import PWAInstallBanner from "$lib/components/layout/PWAInstallBanner.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar";
  import { appStore } from "$lib/stores/app.svelte";
  import { goto } from "$app/navigation";
  
  let { children } = $props();

  // Protect the route - check if onboarding is complete
  $effect(() => {
    if (appStore.initialized && appStore.settings && !appStore.settings.onboardingComplete) {
      goto('/onboarding');
    }
  });

</script>

<Sidebar.Provider>
  <div class="min-h-screen bg-background text-foreground flex w-full h-full">
    <DesktopSidebar />

    <Sidebar.Inset class="flex-1 w-full flex flex-col pt-6 md:pt-0 pb-20 md:pb-0 bg-transparent relative">
      <main class="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative">
        {#if appStore.initialized}
          {@render children()}
        {/if}
      </main>
    </Sidebar.Inset>

    <BottomNav />
    
    <CommandPalette />
    <QuickAddModal />
    <PWAInstallBanner />
  </div>
</Sidebar.Provider>

<style>
  /* Base transitions for page changes */
  main {
    animation: fade-in 0.3s ease-out;
  }
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
