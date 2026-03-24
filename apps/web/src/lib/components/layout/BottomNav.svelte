<script lang="ts">
  import { cn } from "$lib/utils";
  import LayoutDashboard from "@lucide/svelte/icons/layout-dashboard";
  import Wallet from "@lucide/svelte/icons/wallet";
  import Plus from "@lucide/svelte/icons/plus";
  import PiggyBank from "@lucide/svelte/icons/piggy-bank";
  import Sparkles from "@lucide/svelte/icons/sparkles";
  import { page } from "$app/state";

  const links = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
    { href: "/budgets", icon: Wallet, label: "Budget" },
    { href: "/expenses/add", icon: Plus, label: "Add", isFab: true },
    { href: "/savings", icon: PiggyBank, label: "Savings" },
    { href: "/insights", icon: Sparkles, label: "Insights" }
  ];
</script>

<nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg border-t border-border pb-[env(safe-area-inset-bottom)]">
  <div class="flex items-center justify-around px-2 h-16 relative">
    {#each links as link}
      {#if link.isFab}
        <button 
          onclick={() => appStore.showQuickAdd = true}
          class="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
          aria-label={link.label}
        >
          <Plus size={24} />
        </button>
      {:else}
        <a 
          href={link.href}
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
