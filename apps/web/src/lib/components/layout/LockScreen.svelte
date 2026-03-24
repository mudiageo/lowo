<script lang="ts">
  import { lockStore, hashPin } from '$lib/stores/lock.svelte';
  import { appStore } from '$lib/stores/app.svelte';
  import { Button } from '$lib/components/ui/button';
  import ShieldCheck from '@lucide/svelte/icons/shield-check';
  import Fingerprint from '@lucide/svelte/icons/fingerprint';
  import Delete from '@lucide/svelte/icons/delete';

  let pin = $state('');
  let error = $state('');
  let isChecking = $state(false);
  let biometricAvailable = $derived(!!appStore.settings?.biometricEnabled && !!appStore.settings?.biometricCredentialId);

  const digits = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  function press(d: string) {
    if (d === '⌫') {
      pin = pin.slice(0, -1);
      error = '';
    } else if (pin.length < 4) {
      pin += d;
      if (pin.length === 4) verify();
    }
  }

  async function verify() {
    isChecking = true;
    error = '';
    const ok = await lockStore.unlock(pin);
    if (!ok) {
      error = 'Incorrect PIN. Try again.';
      pin = '';
    }
    isChecking = false;
  }

  async function biometricUnlock() {
    isChecking = true;
    error = '';
    const ok = await lockStore.unlockWithBiometric();
    if (!ok) error = 'Biometric failed. Enter your PIN.';
    isChecking = false;
  }

  // Handle keyboard input
  $effect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isChecking) return;
      if (e.key >= '0' && e.key <= '9') {
        press(e.key);
      } else if (e.key === 'Backspace') {
        press('⌫');
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });
</script>

<!-- Full-screen lock overlay -->
<div class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/97 backdrop-blur-sm">
  <div class="flex flex-col items-center gap-6 w-full max-w-xs px-6">

    <!-- Logo mark -->
    <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 text-primary">
      <ShieldCheck class="h-8 w-8" />
    </div>

    <div class="text-center">
      <h2 class="font-heading text-xl font-bold">Lowo is Locked</h2>
      <p class="mt-1 text-sm text-muted-foreground">Enter your PIN to continue</p>
    </div>

    <!-- PIN dots -->
    <div class="flex gap-4">
      {#each Array(4) as _, i}
        <div class="h-4 w-4 rounded-full border-2 transition-all {pin.length > i ? 'bg-primary border-primary scale-110' : 'border-muted-foreground/40'}"></div>
      {/each}
    </div>

    {#if error}
      <p class="text-sm text-destructive">{error}</p>
    {/if}

    <!-- Numpad -->
    <div class="grid grid-cols-3 gap-3 w-full">
      {#each digits as digit}
        {#if digit === ''}
          <div></div>
        {:else if digit === '⌫'}
          <button
            onclick={() => press(digit)}
            class="flex h-14 items-center justify-center rounded-2xl text-lg font-medium text-muted-foreground hover:bg-muted active:scale-95 transition-all"
            aria-label="Backspace"
          >
            <Delete class="h-5 w-5" />
          </button>
        {:else}
          <button
            onclick={() => press(digit)}
            disabled={isChecking}
            class="flex h-14 items-center justify-center rounded-2xl text-xl font-semibold bg-muted/60 hover:bg-muted active:scale-95 transition-all disabled:opacity-40"
          >
            {digit}
          </button>
        {/if}
      {/each}
    </div>

    <!-- Biometric button -->
    {#if biometricAvailable}
      <button
        onclick={biometricUnlock}
        disabled={isChecking}
        class="flex items-center gap-2 text-sm text-primary hover:underline"
      >
        <Fingerprint class="h-4 w-4" />
        Use biometrics instead
      </button>
    {/if}
  </div>
</div>
