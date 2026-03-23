<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar";
  import LayoutDashboard from "@lucide/svelte/icons/layout-dashboard";
  import Wallet from "@lucide/svelte/icons/wallet";
  import Banknote from "@lucide/svelte/icons/banknote";
  import CreditCard from "@lucide/svelte/icons/credit-card";
  import PiggyBank from "@lucide/svelte/icons/piggy-bank";
  import Sparkles from "@lucide/svelte/icons/sparkles";
  import Settings from "@lucide/svelte/icons/settings";
  import { page } from "$app/state";

  const mainLinks = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", shortcut: null },
    { href: "/budgets", icon: Wallet, label: "Budgets", shortcut: "B" },
    { href: "/income", icon: Banknote, label: "Income", shortcut: "I" },
    { href: "/expenses", icon: CreditCard, label: "Expenses", shortcut: "E" },
    { href: "/savings", icon: PiggyBank, label: "Savings", shortcut: "S" },
    { href: "/insights", icon: Sparkles, label: "AI Insights", shortcut: "A" }
  ];
</script>

<Sidebar.Root class="hidden md:flex bg-card/50 border-r border-border min-h-screen">
  <Sidebar.Header class="pt-6 pb-4 px-6">
    <div class="flex items-center space-x-2">
      <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
        <Wallet class="w-[18px] h-[18px] text-primary-foreground" />
      </div>
      <span class="font-heading font-bold text-xl tracking-tight text-foreground">Lowo.</span>
    </div>
  </Sidebar.Header>

  <Sidebar.Content>
    <Sidebar.Group>
      <Sidebar.GroupLabel class="uppercase tracking-wider text-xs">Overview</Sidebar.GroupLabel>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {#each mainLinks as link}
            <Sidebar.MenuItem>
              <Sidebar.MenuButton isActive={page.url.pathname.startsWith(link.href)}>
                {#snippet child({ props })}
                  <a href={link.href} {...props} class="flex w-full items-center justify-between">
                    <span class="flex items-center space-x-2">
                      <link.icon class="w-4 h-4" />
                      <span>{link.label}</span>
                    </span>
                    {#if link.shortcut}
                      <div class="hidden lg:flex items-center justify-center w-5 h-5 rounded border border-border bg-background text-[10px] text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity">
                        {link.shortcut}
                      </div>
                    {/if}
                  </a>
                {/snippet}
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          {/each}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  </Sidebar.Content>

  <Sidebar.Footer class="p-4">
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton isActive={page.url.pathname.startsWith("/settings")}>
          {#snippet child({ props })}
            <a href="/settings" {...props}>
              <Settings class="w-4 h-4" />
              <span>Settings</span>
            </a>
          {/snippet}
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Footer>
</Sidebar.Root>
