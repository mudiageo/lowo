<script lang="ts">
  import { db } from "$lib/db";
  import { appStore } from "$lib/stores/app.svelte";
  import { budgetStore } from "$lib/stores/budget.svelte";
  import { GoogleGenerativeAI } from "@google/generative-ai";
  import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import Sparkles from "@lucide/svelte/icons/sparkles";
  import Bot from "@lucide/svelte/icons/bot";
  import Loader2 from "@lucide/svelte/icons/loader-2";
  import History from "@lucide/svelte/icons/history";

  let isGenerating = $state(false);
  let error = $state("");
  let latestInsight = $state<{content: string, generatedAt: Date} | null>(null);

  async function generateInsights() {
    if (!appStore.settings?.geminiApiKey) {
      error = "Missing Gemini API Key. Please configure it in Settings.";
      return;
    }
    
    isGenerating = true;
    error = "";

    try {
      const genAI = new GoogleGenerativeAI(appStore.settings.geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // Gather context
      const budgets = await db.budgetPeriods.toArray();
      const categories = await db.budgetCategories.toArray();
      const expenses = await db.expenses.toArray();
      const incomes = await db.incomes.toArray();

      const contextData = {
        currency: appStore.settings.currency,
        activeBudgetTotal: budgetStore.activePeriod?.totalAmount || 0,
        spendingProgress: budgetStore.spendingProgress,
        recentExpenses: expenses.slice(0, 50).map(e => ({ amount: e.amount, date: e.date, note: e.notes })),
        recentIncome: incomes.slice(0, 10).map(i => ({ amount: i.amount, label: i.label }))
      };

      const prompt = `
        You are Lowo, a financial advisor for a Nigerian user. 
        Analyze the following financial data and provide exactly 3 concise, actionable insights or recommendations.
        Format your response in Markdown with bullet points. Be encouraging but realistic.
        Do not use code blocks for the output, just bold text and bullet points.
        
        Data context:
        ${JSON.stringify(contextData, null, 2)}
      `;

      const result = await model.generateContent(prompt);
      const output = result.response.text();

      latestInsight = { content: output, generatedAt: new Date() };

      // Save to DB
      await db.aiInsights.add({
        id: crypto.randomUUID(),
        budgetPeriodId: budgetStore.activePeriodId || "global",
        content: output,
        type: "general",
        isRead: true,
        createdAt: new Date()
      });

    } catch (e: any) {
      console.error(e);
      error = e.message || "Failed to generate insights.";
    } finally {
      isGenerating = false;
    }
  }

</script>

<div class="max-w-4xl mx-auto space-y-6 pb-24 md:pb-6">
  
  <div class="flex items-center space-x-3">
    <div class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
      <Sparkles class="w-5 h-5" />
    </div>
    <div>
      <h1 class="text-2xl font-heading font-bold tracking-tight">AI Insights</h1>
      <p class="text-muted-foreground text-sm">Personalized financial recommendations.</p>
    </div>
  </div>

  {#if !appStore.settings?.geminiApiKey}
    <Card class="border-destructive/30 bg-destructive/5">
      <CardContent class="p-6 text-center space-y-4">
        <Bot class="w-12 h-12 mx-auto text-destructive/50" />
        <h3 class="font-medium">API Key Required</h3>
        <p class="text-sm text-muted-foreground max-w-md mx-auto">
          Lowo uses Google's Gemini AI to analyze your spending locally. You need to provide your own API key to use this feature.
        </p>
        <Button href="/settings" variant="outline" class="mt-4">Go to Settings</Button>
      </CardContent>
    </Card>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <div class="lg:col-span-2 space-y-6">
        <Card class="bg-gradient-to-br from-card to-card/50 relative overflow-hidden">
          <!-- Decorative background -->
          <div class="absolute -right-12 -top-12 opacity-5 pointer-events-none">
            <Sparkles class="w-48 h-48" />
          </div>
          
          <CardHeader>
            <CardTitle>Ask Lowo</CardTitle>
            <CardDescription>Generate fresh insights based on your latest financial data.</CardDescription>
          </CardHeader>
          <CardContent>
            {#if error}
              <div class="p-4 rounded-lg bg-destructive/10 text-destructive text-sm mb-4">
                {error}
              </div>
            {/if}

            {#if latestInsight}
              <div class="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-heading prose-headings:tracking-tight mb-6">
                <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                <div>
                    <!-- Simple markdown rendering for MVP. Real app would use a markdown parser -->
                    {#each latestInsight.content.split('\n') as line}
                      {#if line.startsWith('**')}
                         <p class="font-bold mt-3 text-foreground">{line.replace(/\*\*/g, '')}</p>
                      {#else if line.trim().startsWith('* ') || line.trim().startsWith('- ')}
                         <li class="ml-4 mb-2 text-muted-foreground">{line.replace(/^[-*]\s/, '').replace(/\*\*/g, '')}</li>
                      {#else if line.trim()}
                         <p class="text-muted-foreground mb-2">{line.replace(/\*\*/g, '')}</p>
                      {/if}
                    {/each}
                </div>
              </div>
              <p class="text-[10px] text-muted-foreground font-mono uppercase tracking-wider text-right">
                Generated {latestInsight.generatedAt.toLocaleTimeString()}
              </p>
            {:else}
               <div class="py-12 text-center opacity-50">
                 <Bot class="w-16 h-16 mx-auto mb-4" />
                 <p>Ready to analyze your finances.</p>
               </div>
            {/if}
          </CardContent>
          <CardFooter class="bg-muted/10 border-t border-border mt-auto pt-6">
            <Button onclick={generateInsights} disabled={isGenerating} class="w-full">
              {#if isGenerating}
                <Loader2 class="w-4 h-4 mr-2 animate-spin" /> Analyzing your data...
              {:else}
                <Sparkles class="w-4 h-4 mr-2" /> Generate New Insights
              {/if}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div class="lg:col-span-1">
         <Card>
           <CardHeader>
             <CardTitle class="flex items-center space-x-2 text-base">
                <History class="w-4 h-4" />
                <span>History</span>
             </CardTitle>
           </CardHeader>
           <CardContent>
             <div class="text-center p-6 text-sm text-muted-foreground border border-dashed border-border rounded-lg">
                View past insights (Coming soon)
             </div>
           </CardContent>
         </Card>
      </div>

    </div>
  {/if}

</div>
