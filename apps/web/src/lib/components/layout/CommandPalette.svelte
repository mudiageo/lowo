<script lang="ts">
  import * as Command from "$lib/components/ui/command";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import Plus from "@lucide/svelte/icons/plus";
  import Wallet from "@lucide/svelte/icons/wallet";
  import PiggyBank from "@lucide/svelte/icons/piggy-bank";
  import Sparkles from "@lucide/svelte/icons/sparkles";
  import Download from "@lucide/svelte/icons/download";
  import Moon from "@lucide/svelte/icons/moon";
  import Sun from "@lucide/svelte/icons/sun";
  import LayoutDashboard from "@lucide/svelte/icons/layout-dashboard";
  import { appStore } from "$lib/stores/app.svelte";

  let open = $state(false);

  onMount(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        open = !open;
      }
      // Simple keyboard shortcuts to routes
      if (!open && e.target === document.body) {
        if (e.key.toLowerCase() === 'n') goto('/expenses/add');
        if (e.key.toLowerCase() === 'b') goto('/budgets');
        if (e.key.toLowerCase() === 's') goto('/savings');
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  });

  function runCommand(action: () => void) {
    action();
    open = false;
  }

  function toggleTheme() {
    if (!appStore.settings) return;
    const currentTheme = appStore.settings.theme;
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    appStore.updateSettings({ theme: nextTheme });
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

</script>

<Command.Dialog bind:open>
  <Command.Input placeholder="Type a command or search..." />
  <Command.List>
    <Command.Empty>No results found.</Command.Empty>
    
    <Command.Group heading="Quick Actions">
      <Command.Item onSelect={() => runCommand(() => goto('/expenses/add'))}>
        <Plus class="mr-2 h-4 w-4" />
        <span>New Expense</span>
        <Command.Shortcut>N</Command.Shortcut>
      </Command.Item>
      <Command.Item onSelect={() => runCommand(() => goto('/budgets'))}>
        <Wallet class="mr-2 h-4 w-4" />
        <span>New Budget Period</span>
        <Command.Shortcut>B</Command.Shortcut>
      </Command.Item>
      <Command.Item onSelect={() => runCommand(() => goto('/savings'))}>
        <PiggyBank class="mr-2 h-4 w-4" />
        <span>New Savings Goal</span>
        <Command.Shortcut>S</Command.Shortcut>
      </Command.Item>
      <Command.Item onSelect={() => runCommand(() => goto('/income'))}>
        <Wallet class="mr-2 h-4 w-4" />
        <span>Log Income</span>
      </Command.Item>
    </Command.Group>

    <Command.Separator />
    
    <Command.Group heading="Navigation">
      <Command.Item onSelect={() => runCommand(() => goto('/dashboard'))}>
        <LayoutDashboard class="mr-2 h-4 w-4" />
        <span>Go to Dashboard</span>
      </Command.Item>
      <Command.Item onSelect={() => runCommand(() => goto('/insights'))}>
        <Sparkles class="mr-2 h-4 w-4" />
        <span>Go to Insights</span>
      </Command.Item>
    </Command.Group>

    <Command.Separator />
    
    <Command.Group heading="Settings">
      <Command.Item onSelect={() => runCommand(toggleTheme)}>
        {#if appStore.settings?.theme === 'dark'}
          <Sun class="mr-2 h-4 w-4" />
          <span>Light Mode</span>
        {:else}
          <Moon class="mr-2 h-4 w-4" />
          <span>Dark Mode</span>
        {/if}
      </Command.Item>
      <Command.Item onSelect={() => runCommand(() => alert('Exporting Data...'))}>
        <Download class="mr-2 h-4 w-4" />
        <span>Export Data</span>
      </Command.Item>
      {#if appStore.settings?.aiEnabled}
        <Command.Item onSelect={() => runCommand(() => goto('/insights'))}>
          <Sparkles class="mr-2 h-4 w-4" />
          <span>Generate AI Insights</span>
        </Command.Item>
      {/if}
    </Command.Group>
  </Command.List>
</Command.Dialog>
