<script lang="ts">
  import { pwaStore } from '$lib/stores/pwa.svelte';
  import { Button } from '$lib/components/ui/button';
  import Download from '@lucide/svelte/icons/download';
  import X from '@lucide/svelte/icons/x';
  import Smartphone from '@lucide/svelte/icons/smartphone';

  let dismissed = $state(false);

  const show = $derived(pwaStore.isInstallable && !pwaStore.isInstalled && !dismissed);

  async function install() {
    const outcome = await pwaStore.promptInstall();
    if (outcome === 'dismissed') dismissed = true;
  }
</script>

{#if show}
  <!-- Slide-up install banner at bottom of screen -->
  <div class="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
    <div class="flex items-center justify-between gap-4 rounded-2xl border border-primary/30 bg-card/95 p-4 shadow-2xl backdrop-blur-sm">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
          <Smartphone class="h-5 w-5" />
        </div>
        <div>
          <p class="text-sm font-semibold">Install Lowo</p>
          <p class="text-xs text-muted-foreground">Works offline, no app store needed</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <Button size="sm" onclick={install}>
          <Download class="mr-1.5 h-3.5 w-3.5" />
          Install
        </Button>
        <Button size="icon" variant="ghost" class="h-8 w-8 text-muted-foreground" onclick={() => dismissed = true}>
          <X class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
{/if}
