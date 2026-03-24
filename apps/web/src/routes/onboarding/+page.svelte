<script lang="ts">
  import { appStore } from "$lib/stores/app.svelte";
  import { budgetStore } from "$lib/stores/budget.svelte";
  import { db } from "$lib/db";
  import { hashPin } from "$lib/stores/lock.svelte";
  import { goto } from "$app/navigation";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "$lib/components/ui/card";
  import Sparkles from "@lucide/svelte/icons/sparkles";
  import Wallet from "@lucide/svelte/icons/wallet";
  import ShieldCheck from "@lucide/svelte/icons/shield-check";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import Check from "@lucide/svelte/icons/check";
  
  let step = $state(1);
  let loading = $state(false);

  // Form Data
  let userName = $state("");
  let currency = $state<"NGN" | "USD">("NGN");
  
  let incomeAmount = $state("");
  let incomeFrequency = $state<"one_time" | "weekly" | "biweekly" | "monthly" | "irregular">("monthly");
  
  let budgetTotal = $state("");
  
  let pinEnabled = $state(false);
  let pin = $state("");
  let geminiApiKey = $state("");

  async function completeOnboarding() {
    loading = true;
    try {
      // 1. Update Settings
      await appStore.updateSettings({
        userName,
        currency,
        pinEnabled,
        pinHash: pinEnabled ? await hashPin(pin) : undefined,
        geminiApiKey,
        onboardingComplete: true,
        hasCompletedOnboarding: true
      });

      // 2. Add Income if provided
      if (Number(incomeAmount) > 0) {
        await db.incomes.add({
          id: crypto.randomUUID(),
          label: "Primary Income",
          amount: Number(incomeAmount),
          frequency: incomeFrequency,
          date: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // 3. Create initial budget period if provided
      if (Number(budgetTotal) > 0) {
        const periodId = crypto.randomUUID();
        const start = new Date();
        start.setHours(0,0,0,0);
        
        await db.budgetPeriods.add({
          id: periodId,
          name: "First Budget",
          periodType: "monthly",
          startDate: start,
          currency,
          totalAmount: Number(budgetTotal),
          createdAt: new Date()
        });

        // 4. Seed Nigerian Default Categories
        const defaultCats = [
          { name: "Airtime & Data", icon: "smartphone", allocatedAmount: 0, color: "#3B82F6" },
          { name: "NEPA/Electricity", icon: "zap", allocatedAmount: 0, color: "#F59E0B" },
          { name: "Transport/Fuel", icon: "car", allocatedAmount: 0, color: "#10B981" },
          { name: "Food (Market)", icon: "shopping-cart", allocatedAmount: 0, color: "#EF4444" },
          { name: "Food (Eating Out)", icon: "utensils", allocatedAmount: 0, color: "#F97316" },
          { name: "Tithe & Offering", icon: "church", allocatedAmount: 0, color: "#8B5CF6" },
          { name: "Rent & Service Charge", icon: "home", allocatedAmount: 0, color: "#EC4899" },
          { name: "Family Support", icon: "users", allocatedAmount: 0, color: "#14B8A6" },
          { name: "Savings/Investments", icon: "piggy-bank", allocatedAmount: 0, color: "#6366F1" },
        ];

        for (const cat of defaultCats) {
          await db.budgetCategories.add({
            id: crypto.randomUUID(),
            budgetPeriodId: periodId,
            name: cat.name,
            icon: cat.icon,
            allocatedAmount: cat.allocatedAmount, // empty for now, user manually adds later
            color: cat.color,
            isNigerianDefault: true
          });
        }
      }

      // Force stores to refresh? They use liveQuery so it's automatic.
      goto('/dashboard');
    } catch (e) {
      console.error(e);
      alert("Failed to save settings. Please try again.");
    } finally {
      loading = false;
    }
  }

  function nextStep() {
    if (step === 1 && !userName) return;
    if (step === 2 && !incomeAmount) return; // you can skip or enforce? Let's not enforce.
    step++;
  }

  function prevStep() {
    step--;
  }

</script>

<div class="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
  <!-- Glowing background effect -->
  <div class="absolute w-96 h-96 bg-primary/20 blur-[100px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10"></div>
  
  <Card class="w-full max-w-lg border-border bg-card/50 backdrop-blur shadow-2xl">
    <CardHeader class="pb-4 border-b border-border/50">
      <div class="flex items-center space-x-2 mb-2">
        <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Wallet size={18} class="text-primary-foreground" />
        </div>
        <span class="font-heading font-bold text-xl tracking-tight text-foreground">Lowo.</span>
      </div>
      <CardTitle class="text-2xl mt-4">
        {#if step === 1} Welcome to Lowo 👋
        {:else if step === 2} Your Income 💰
        {:else if step === 3} First Budget 📊
        {:else if step === 4} Security 🔒
        {:else} AI Assistant 🤖
        {/if}
      </CardTitle>
      <CardDescription>
        {#if step === 1} Let's personalize your financial experience.
        {:else if step === 2} How much do you earn starting out?
        {:else if step === 3} Set a total monthly budget to aim for. We'll seed standard Nigerian categories for you!
        {:else if step === 4} Optional: Protect your data locally.
        {:else} Optional: Bring your own Gemini API key for smart insights.
        {/if}
      </CardDescription>
      <div class="flex space-x-1 mt-4">
        {#each [1,2,3,4,5] as i}
          <div class="h-1 flex-1 rounded-full transition-colors {i <= step ? 'bg-primary' : 'bg-muted'}"></div>
        {/each}
      </div>
    </CardHeader>
    
    <CardContent class="pt-6 space-y-6">
      {#if step === 1}
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="name">What should we call you?</Label>
            <Input id="name" bind:value={userName} placeholder="e.g., Tunde" required />
          </div>
          <div class="space-y-2">
            <Label>Base Currency</Label>
            <div class="flex space-x-2">
              <Button type="button" variant={currency === "NGN" ? "default" : "outline"} class="w-1/2" onclick={() => currency = "NGN"}>
                ₦ NGN
              </Button>
              <Button type="button" variant={currency === "USD" ? "default" : "outline"} class="w-1/2" onclick={() => currency = "USD"}>
                $ USD
              </Button>
            </div>
          </div>
        </div>

      {:else if step === 2}
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="income">Primary Income Amount</Label>
            <Input id="income" type="number" bind:value={incomeAmount} placeholder="e.g. 500000" />
          </div>
          <div class="space-y-2">
            <Label>Frequency</Label>
            <select bind:value={incomeFrequency} class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <option value="monthly">Monthly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="weekly">Weekly</option>
              <option value="irregular">Irregular / Freelance</option>
            </select>
          </div>
        </div>

      {:else if step === 3}
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="budget">Toal Budget Target</Label>
            <Input id="budget" type="number" bind:value={budgetTotal} placeholder="e.g. 400000" />
            <p class="text-xs text-muted-foreground mt-2">
              We'll automatically set this as a Monthly period and load common categories like Airtime, NEPA, and Tithe. You can edit this later.
            </p>
          </div>
        </div>

      {:else if step === 4}
        <div class="space-y-6">
          <div class="flex items-start space-x-3 bg-secondary/30 p-4 rounded-xl border border-border">
            <ShieldCheck class="w-10 h-10 text-primary mt-1" />
            <div>
              <h4 class="font-medium text-foreground">Local PIN Security</h4>
              <p class="text-sm text-muted-foreground mt-1 text-balance">
                Require a 4-digit PIN when opening Lowo. This keeps your financial data out of sight from snooping friends.
              </p>
          </div>
          <div class="flex space-x-2">
            <Button type="button" variant={pinEnabled ? "default" : "outline"} class="w-1/2" onclick={() => pinEnabled = true}>
              Enabled
            </Button>
            <Button type="button" variant={!pinEnabled ? "default" : "outline"} class="w-1/2" onclick={() => pinEnabled = false}>
              Disabled
            </Button>
          </div>
          
          {#if pinEnabled}
            <div class="space-y-2 animate-in fade-in slide-in-from-top-2">
              <Label for="pin">Set 4-Digit PIN</Label>
              <Input
                id="pin"
                type="password"
                inputmode="numeric"
                maxlength={4}
                bind:value={pin}
                placeholder="0000"
                class="text-center text-2xl tracking-[1em]"
              />
            </div>
          {/if}
        </div>

      {:else}
        <div class="space-y-6">
          <div class="flex items-start space-x-3 bg-secondary/30 p-4 rounded-xl border border-border">
            <Sparkles class="w-10 h-10 text-primary mt-1" />
            <div>
              <h4 class="font-medium text-foreground">AI Intelligence</h4>
              <p class="text-sm text-muted-foreground mt-1 text-balance">
                Get personalized spending analysis, personality traits, and savings coaching using Google's Gemini.
              </p>
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" class="text-xs text-primary hover:underline mt-2 inline-block">
                Get a free API key here
              </a>
            </div>
          </div>
          <div class="space-y-2">
            <Label for="api">Gemini 2.5 Flash API Key</Label>
            <Input id="api" type="password" bind:value={geminiApiKey} placeholder="AIzaSy..." />
            <p class="text-xs text-muted-foreground mt-1">Stored safely on your device. Never sent to any central Lowo server.</p>
          </div>
        </div>

      {/if}
    </CardContent>
    
    <CardFooter class="flex justify-between border-t border-border/50 pt-6">
      <Button variant="ghost" disabled={step === 1 || loading} onclick={prevStep}>
        Back
      </Button>
      
      {#if step < 5}
        <Button disabled={step === 1 && !userName} onclick={nextStep}>
          Next <ArrowRight class="ml-2 w-4 h-4" />
        </Button>
      {:else}
        <Button disabled={loading} onclick={completeOnboarding} class="bg-primary text-primary-foreground">
          {#if loading}
            Setting up...
          {:else}
            Let's Go! <Check class="ml-2 w-4 h-4" />
          {/if}
        </Button>
      {/if}
    </CardFooter>
  </Card>
</div>
