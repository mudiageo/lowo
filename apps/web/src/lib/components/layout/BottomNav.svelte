<script lang="ts">
  import { cn } from "$lib/utils";
  import { appStore } from "$lib/stores/app.svelte";
  import LayoutDashboard from "@lucide/svelte/icons/layout-dashboard";
  import Wallet from "@lucide/svelte/icons/wallet";
  import PiggyBank from "@lucide/svelte/icons/piggy-bank";
  import Sparkles from "@lucide/svelte/icons/sparkles";
  import Plus from "@lucide/svelte/icons/plus";
  import X from "@lucide/svelte/icons/x";
  import TrendingDown from "@lucide/svelte/icons/trending-down";
  import Banknote from "@lucide/svelte/icons/banknote";
  import { page } from "$app/state";

  const navLinks = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
    { href: "/budgets",   icon: Wallet,          label: "Budget" },
    null, // FAB placeholder
    { href: "/savings",   icon: PiggyBank,        label: "Savings" },
    { href: "/insights",  icon: Sparkles,         label: "Insights" },
  ];

  let fabOpen = $state(false);

  function openExpense() {
    fabOpen = false;
    appStore.showQuickAdd = true;
  }

  function openIncome() {
    fabOpen = false;
    appStore.showQuickAddIncome = true;
  }
</script>

<nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border pb-[env(safe-area-inset-bottom)]">
  <div class="flex items-center justify-around px-2 h-16 relative">
    {#each navLinks as link}
      {#if link === null}
        <div class="relative flex flex-col items-center justify-center w-16">

          {#if fabOpen}
            <!-- dim backdrop -->
            <button class="fixed inset-0 z-40 bg-black/30" onclick={() => fabOpen = false} aria-label="Close"></button>

            <!-- Expense option (left) -->
            <div class="absolute bottom-[20px] left-1/2 -translate-x-[90px] z-50 flex flex-col items-center gap-1.5 animate-in fade-in slide-in-from-right-4 duration-200">
              <button
                onclick={openExpense}
                class="flex h-12 w-12 items-center justify-center rounded-full bg-destructive shadow-xl hover:scale-110 active:scale-90 transition-transform"
                aria-label="Add expense"
              >
                <TrendingDown class="h-5 w-5 text-white" />
              </button>
              <span class="rounded-full bg-card/80 backdrop-blur-sm border border-border px-2.5 py-0.5 text-[10px] font-bold shadow text-destructive tracking-tight">EXPENSE</span>
            </div>

            <!-- Income option (right) -->
            <div class="absolute bottom-[20px] left-1/2 translate-x-[42px] z-50 flex flex-col items-center gap-1.5 animate-in fade-in slide-in-from-left-4 duration-200">
              <button
                onclick={openIncome}
                class="flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-xl hover:scale-110 active:scale-90 transition-transform"
                aria-label="Log income"
              >
                <Banknote class="h-5 w-5 text-primary-foreground" />
              </button>
              <span class="rounded-full bg-card/80 backdrop-blur-sm border border-border px-2.5 py-0.5 text-[10px] font-bold shadow text-primary tracking-tight">INCOME</span>
            </div>
          {/if}

          <!-- Main FAB -->
          <button
            onclick={() => fabOpen = !fabOpen}
            class={cn(
              "absolute -top-6 left-1/2 -translate-x-1/2 z-50 w-14 h-14 text-primary-foreground rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 active:scale-95",
              fabOpen ? "bg-foreground rotate-45" : "bg-primary"
            )}
            aria-label="Quick add"
          >
            <Plus size={26} />
          </button>
        </div>
      {:else}
        <a
          href={link.href}
          onclick={() => { fabOpen = false; }}
          class={cn(
            "flex flex-col items-center justify-center w-full h-full text-muted-foreground transition-colors",
            page.url.pathname.startsWith(link.href) && "text-primary font-medium"
          )}
        >
          <link.icon size={20} class="mb-1" />
          <span class="text-[10px] uppercase font-sans tracking-wide">{link.label}</span>
        </a>
      {/if}
    {/each}
  </div>
</nav>
