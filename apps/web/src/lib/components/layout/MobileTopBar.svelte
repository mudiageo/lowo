<script lang="ts">
  import { goto } from "$app/navigation";
  import { appStore } from "$lib/stores/app.svelte";
  import { page } from "$app/state";
  import Settings from "@lucide/svelte/icons/settings";
  import User from "@lucide/svelte/icons/user";
  import Moon from "@lucide/svelte/icons/moon";
  import Sun from "@lucide/svelte/icons/sun";
  import Sparkles from "@lucide/svelte/icons/sparkles";
  import LogOut from "@lucide/svelte/icons/log-out";
  import TrendingDown from "@lucide/svelte/icons/trending-down";
  import Banknote from "@lucide/svelte/icons/banknote";

  let dropdownOpen = $state(false);

  // Get current page label for header
  const pageTitle = $derived(() => {
    const p = page.url.pathname;
    if (p.startsWith('/dashboard')) return 'Dashboard';
    if (p.startsWith('/budgets')) return 'Budgets';
    if (p.startsWith('/expenses')) return 'Expenses';
    if (p.startsWith('/income')) return 'Income';
    if (p.startsWith('/savings')) return 'Savings Goals';
    if (p.startsWith('/insights')) return 'AI Insights';
    if (p.startsWith('/settings')) return 'Settings';
    return 'Lowo';
  });

  function toggleTheme() {
    if (!appStore.settings) return;
    const next = appStore.settings.theme === 'dark' ? 'light' : 'dark';
    appStore.updateSettings({ theme: next });
    document.documentElement.classList.toggle('dark', next === 'dark');
    dropdownOpen = false;
  }
</script>

<!-- Mobile top bar — hidden on md+ where the sidebar handles navigation -->
<header class="md:hidden fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur">
  <!-- Logo / Page title -->
  <div class="flex items-center space-x-2">
    <div class="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
      <Sparkles class="h-4 w-4 text-primary-foreground" />
    </div>
    <span class="font-heading font-bold text-base tracking-tight">{pageTitle()}</span>
  </div>

  <div class="flex items-center space-x-2 ml-auto mr-3">
    <button
      onclick={() => appStore.showQuickAdd = true}
      class="flex h-8 items-center space-x-1 rounded-full bg-destructive/10 px-2.5 text-destructive transition-colors hover:bg-destructive/20 active:scale-95"
    >
      <TrendingDown class="h-3.5 w-3.5" />
      <span class="text-[10px] font-bold uppercase tracking-wider">Expense</span>
    </button>
    <button
      onclick={() => appStore.showQuickAddIncome = true}
      class="flex h-8 items-center space-x-1 rounded-full bg-primary/10 px-2.5 text-primary transition-colors hover:bg-primary/20 active:scale-95"
    >
      <Banknote class="h-3.5 w-3.5" />
      <span class="text-[10px] font-bold uppercase tracking-wider">Income</span>
    </button>
  </div>

  <!-- User avatar / settings trigger -->
  <div class="relative">
    <button
      onclick={() => dropdownOpen = !dropdownOpen}
      class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary transition-colors hover:bg-primary/30"
      aria-label="Open settings"
    >
      <User class="h-4 w-4" />
    </button>

    {#if dropdownOpen}
      <!-- Backdrop -->
      <button
        class="fixed inset-0 z-40"
        onclick={() => dropdownOpen = false}
        aria-label="Close menu"
      ></button>

      <!-- Dropdown -->
      <div class="absolute right-0 top-10 z-50 w-48 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
        <!-- User info -->
        <div class="border-b border-border px-4 py-3">
          <p class="text-sm font-semibold">{appStore.settings?.userName || 'You'}</p>
          <p class="text-xs text-muted-foreground capitalize">{appStore.settings?.currency || 'NGN'} account</p>
        </div>

        <!-- Actions -->
        <div class="py-1">
          <button
            onclick={toggleTheme}
            class="flex w-full items-center space-x-3 px-4 py-2.5 text-sm hover:bg-muted/60 transition-colors"
          >
            {#if appStore.settings?.theme === 'dark'}
              <Sun class="h-4 w-4 text-muted-foreground" />
              <span>Light Mode</span>
            {:else}
              <Moon class="h-4 w-4 text-muted-foreground" />
              <span>Dark Mode</span>
            {/if}
          </button>

          <button
            onclick={() => { goto('/settings'); dropdownOpen = false; }}
            class="flex w-full items-center space-x-3 px-4 py-2.5 text-sm hover:bg-muted/60 transition-colors"
          >
            <Settings class="h-4 w-4 text-muted-foreground" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    {/if}
  </div>
</header>
