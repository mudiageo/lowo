<script lang="ts">
  import { appStore } from "$lib/stores/app.svelte";
  import { db } from "$lib/db";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Button } from "$lib/components/ui/button";
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "$lib/components/ui/card";
  import Save from "@lucide/svelte/icons/save";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  
  // Clone settings to form to avoid auto-updating until saved
  let formSettings = $state({
    userName: appStore.settings?.userName || "",
    currency: appStore.settings?.currency || "NGN",
    theme: appStore.settings?.theme || "dark",
    geminiApiKey: appStore.settings?.geminiApiKey || ""
  });

  let isSaving = $state(false);

  async function saveSettings() {
    isSaving = true;
    try {
      await appStore.updateSettings(formSettings);
      
      // Apply theme
      if (formSettings.theme === 'dark') {
          document.documentElement.classList.add('dark');
      } else {
          document.documentElement.classList.remove('dark');
      }

      alert("Settings saved successfully.");
    } catch(e) {
      alert("Failed to save settings.");
    } finally {
      isSaving = false;
    }
  }

  async function clearData() {
    const confirmation = prompt("This will delete ALL your data locally. Type 'DELETE' to confirm.");
    if (confirmation === "DELETE") {
      try {
        await Promise.all([
          db.budgetPeriods.clear(),
          db.budgetCategories.clear(),
          db.expenses.clear(),
          db.incomes.clear(),
          db.savingsGoals.clear(),
          db.savingsContributions.clear(),
          db.aiInsights.clear(),
          appStore.updateSettings({ hasCompletedOnboarding: false }) // Keep simple settings like name but trigger onboarding again
        ]);
        window.location.href = "/onboarding";
      } catch (e) {
        alert("Failed to clear data.");
      }
    }
  }

</script>

<div class="max-w-3xl mx-auto space-y-6 pb-24 md:pb-6">
  
  <div>
    <h1 class="text-2xl font-heading font-bold tracking-tight">Settings</h1>
    <p class="text-muted-foreground text-sm">Manage your application preferences and data.</p>
  </div>

  <form onsubmit={(e) => { e.preventDefault(); saveSettings(); }}>
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>Update your personal information and app appearance.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label>Your Name</Label>
          <Input bind:value={formSettings.userName} placeholder="e.g. Chinedu" required />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label>Base Currency</Label>
            <select bind:value={formSettings.currency} class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
              <option value="NGN">NGN (₦)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
          <div class="space-y-2">
            <Label>Theme</Label>
            <select bind:value={formSettings.theme} class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
        </div>

      </CardContent>
    </Card>

    <Card class="mt-6">
      <CardHeader>
        <CardTitle>AI Integration (Gemini)</CardTitle>
        <CardDescription>Configure your API key for personalized financial insights.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label>Google Gemini API Key</Label>
          <Input type="password" bind:value={formSettings.geminiApiKey} placeholder="AIzaSy..." />
          <p class="text-xs text-muted-foreground">Your key is stored locally in IndexedDB and never sent to our servers.</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button type="submit" class="w-full" disabled={isSaving}>
          {#if isSaving} Saving... {:else} <Save class="w-4 h-4 mr-2" /> Save Settings {/if}
        </Button>
      </CardFooter>
    </Card>
  </form>

  <Card class="border-destructive/50 mt-12 bg-destructive/5">
    <CardHeader>
      <CardTitle class="text-destructive">Danger Zone</CardTitle>
      <CardDescription>Irreversible actions for your local data.</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-medium text-sm">Clear Application Data</h4>
          <p class="text-xs text-muted-foreground max-w-[250px] sm:max-w-none">This will permanently delete all your budgets, expenses, incomes, and goals from this device.</p>
        </div>
        <Button variant="destructive" onclick={clearData}>
          <Trash2 class="w-4 h-4 mr-2" /> Clear All Data
        </Button>
      </div>
    </CardContent>
  </Card>

</div>
