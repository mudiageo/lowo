<script lang="ts">
	import { db } from '$lib/db';
	import { appStore } from '$lib/stores/app.svelte';
	import { budgetStore } from '$lib/stores/budget.svelte';
	import { GoogleGenerativeAI } from '@google/generative-ai';
	import {
		Card,
		CardHeader,
		CardTitle,
		CardContent,
		CardDescription,
		CardFooter
	} from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import Bot from '@lucide/svelte/icons/bot';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import History from '@lucide/svelte/icons/history';

	let isGenerating = $state(false);
	let error = $state('');
	let latestInsight = $state<{ content: string; generatedAt: Date } | null>(null);

	async function generateInsights() {
		if (!appStore.settings?.geminiApiKey) {
			error = 'Missing Gemini API Key. Please configure it in Settings.';
			return;
		}

		isGenerating = true;
		error = '';

		try {
			const genAI = new GoogleGenerativeAI(appStore.settings.geminiApiKey);
			const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

			// Gather context
			const budgets = await db.budgetPeriods.toArray();
			const categories = await db.budgetCategories.toArray();
			const expenses = await db.expenses.toArray();
			const incomes = await db.incomes.toArray();

			const contextData = {
				currency: appStore.settings.currency,
				activeBudgetTotal: budgetStore.activePeriod?.totalAmount || 0,
				spendingProgress: budgetStore.spendingProgress,
				recentExpenses: expenses
					.slice(0, 50)
					.map((e) => ({ amount: e.amount, date: e.date, note: e.note })),
				recentIncome: incomes.slice(0, 10).map((i) => ({ amount: i.amount, label: i.label }))
			};

			const prompt = `
        You are Lowo, a financial advisor for a Nigerian user. 
        Analyze the following financial data and provide:
        1. A "Financial Personality" card (e.g. "The Vigilant Saver", "The Lifestyle Strategist") with a one-sentence description.
        2. Exactly 3 concise, actionable insights or recommendations.
        
        Format your response in Markdown:
        - Use ## for the Personality Title
        - Use > for the personality description
        - Use bullet points for the 3 insights.
        
        Be encouraging but realistic. Nigerian context: focus on relatable tips like "Bulk buying in the market", "Managing airtime/data", "Power/NEPA budgeting".
        
        Data context:
        ${JSON.stringify(contextData, null, 2)}
      `;

			const result = await model.generateContent(prompt);
			const output = result.response.text();

			latestInsight = { content: output, generatedAt: new Date() };

			// Save to DB
			await db.aiInsights.add({
				id: crypto.randomUUID(),
				budgetPeriodId: budgetStore.activePeriodId || 'global',
				content: output,
				type: 'general',
				isRead: true,
				createdAt: new Date(),
				generatedAt: new Date(),
				model: 'gemini-2.5-flash'
			});
		} catch (e: any) {
			console.error(e);
			error = e.message || 'Failed to generate insights.';
		} finally {
			isGenerating = false;
		}
	}
</script>

<svelte:head>
	<title>AI Insights — Lowo</title>
</svelte:head>

<div class="mx-auto max-w-4xl space-y-6 pb-24 md:pb-6">
	<div class="flex items-center space-x-3">
		<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
			<Sparkles class="h-5 w-5" />
		</div>
		<div>
			<h1 class="font-heading text-2xl font-bold tracking-tight">AI Insights</h1>
			<p class="text-sm text-muted-foreground">Personalized financial recommendations.</p>
		</div>
	</div>

	{#if !appStore.settings?.geminiApiKey}
		<Card class="border-destructive/30 bg-destructive/5">
			<CardContent class="space-y-4 p-6 text-center">
				<Bot class="mx-auto h-12 w-12 text-destructive/50" />
				<h3 class="font-medium">API Key Required</h3>
				<p class="mx-auto max-w-md text-sm text-muted-foreground">
					Lowo uses Google's Gemini AI to analyze your spending locally. You need to provide your
					own API key to use this feature.
				</p>
				<Button href="/settings" variant="outline" class="mt-4">Go to Settings</Button>
			</CardContent>
		</Card>
	{:else}
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<div class="space-y-6 lg:col-span-2">
				<Card class="relative overflow-hidden bg-gradient-to-br from-card to-card/50">
					<!-- Decorative background -->
					<div class="pointer-events-none absolute -top-12 -right-12 opacity-5">
						<Sparkles class="h-48 w-48" />
					</div>

					<CardHeader>
						<CardTitle>Ask Lowo</CardTitle>
						<CardDescription
							>Generate fresh insights based on your latest financial data.</CardDescription
						>
					</CardHeader>
					<CardContent>
						{#if error}
							<div class="mb-4 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
								{error}
							</div>
						{/if}

						{#if latestInsight}
							<div
								class="prose prose-sm mb-6 max-w-none dark:prose-invert prose-headings:font-heading prose-headings:tracking-tight prose-p:leading-relaxed"
							>
								<!-- eslint-disable-next-line svelte/no-at-html-tags -->
								<div>
									<!-- Simple markdown rendering for MVP. Real app would use a markdown parser -->
									{#each latestInsight.content.split('\n') as line}
										{#if line.startsWith('##')}
											<h3 class="mt-6 mb-2 text-xl font-bold text-primary">{line.replace(/^##\s*/, '').replace(/\*\*/g, '')}</h3>
										{:else if line.trim().startsWith('>')}
											<div class="mb-6 p-4 bg-primary/5 border-l-4 border-primary italic text-muted-foreground">
												{line.replace(/^>\s*/, '').replace(/\*\*/g, '')}
											</div>
										{:else if line.startsWith('**') || (line.includes('**') && line.length < 50)}
											<p class="mt-3 font-bold text-foreground">{line.replace(/\*\*/g, '')}</p>
										{:else if line.trim().startsWith('* ') || line.trim().startsWith('- ')}
											<li class="mb-2 ml-4 text-muted-foreground">
												{line.replace(/^[-*]\s/, '').replace(/\*\*/g, '')}
											</li>
										{:else if line.trim()}
											<p class="mb-2 text-muted-foreground">{line.replace(/\*\*/g, '')}</p>
										{/if}
									{/each}
								</div>
							</div>
							<p
								class="text-right font-mono text-[10px] tracking-wider text-muted-foreground uppercase"
							>
								Generated {latestInsight.generatedAt.toLocaleTimeString()}
							</p>
						{:else}
							<div class="py-12 text-center opacity-50">
								<Bot class="mx-auto mb-4 h-16 w-16" />
								<p>Ready to analyze your finances.</p>
							</div>
						{/if}
					</CardContent>
					<CardFooter class="mt-auto border-t border-border bg-muted/10 pt-6">
						<Button onclick={generateInsights} disabled={isGenerating} class="w-full">
							{#if isGenerating}
								<Loader2 class="mr-2 h-4 w-4 animate-spin" /> Analyzing your data...
							{:else}
								<Sparkles class="mr-2 h-4 w-4" /> Generate New Insights
							{/if}
						</Button>
					</CardFooter>
				</Card>
			</div>

			<div class="lg:col-span-1">
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center space-x-2 text-base">
						<History class="h-4 w-4" />
						<span>History</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					{#await db.aiInsights.orderBy('createdAt').reverse().limit(5).toArray()}
						<p class="text-xs text-muted-foreground text-center py-4">Loading...</p>
					{:then insights}
						{#if insights.length === 0}
							<div class="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
								No past insights yet.
							</div>
						{:else}
							<div class="space-y-2">
								{#each insights as insight}
									<button
										class="w-full text-left rounded-lg border border-border bg-muted/30 p-3 text-xs hover:bg-muted/60 transition-colors"
										onclick={() => latestInsight = { content: insight.content, generatedAt: new Date(insight.createdAt) }}
									>
										<p class="font-medium text-foreground/80 line-clamp-1">{insight.content.split('\n')[0].replace(/^##?\s*/, '').replace(/\*\*/g, '').slice(0, 40)}...</p>
										<p class="mt-1 text-muted-foreground">{new Date(insight.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
									</button>
								{/each}
							</div>
						{/if}
					{/await}
				</CardContent>
			</Card>
		</div>
	</div>
{/if}
</div>
