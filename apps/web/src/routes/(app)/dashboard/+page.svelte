<script lang="ts">
	import { appStore } from '$lib/stores/app.svelte';
	import { budgetStore } from '$lib/stores/budget.svelte';
	import { getBudgetPeriodDates } from '$lib/features/budget/utils';
	import { db } from '$lib/db';
	import { liveQuery } from 'dexie';
	import Wallet from '@lucide/svelte/icons/wallet';
	import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import { Button } from '$lib/components/ui/button';
	import DynamicIcon from '$lib/components/ui/DynamicIcon.svelte';
	import type { Expense, Income, SavingsGoal, BudgetCategory } from '$lib/db/schema';

	// Subscribe to incomes and savings goals for current period context
	let incomes: Income[] = $state([]);
	let savingsGoals: SavingsGoal[] = $state([]);
	let recentExpenses: (Expense & { category?: BudgetCategory })[] = $state([]);

	$effect(() => {
		// Get recent 5 expenses globally or for this period
		const subE = liveQuery(async () => {
			const exps = await db.expenses.orderBy('date').reverse().limit(5).toArray();
			return Promise.all(
				exps.map(async (e) => ({
					...e,
					category: await db.budgetCategories.get(e.categoryId)
				}))
			);
		}).subscribe((v) => (recentExpenses = v as any));

		const subI = liveQuery(() => db.incomes.toArray()).subscribe((v) => (incomes = v));

		const subS = liveQuery(() => db.savingsGoals.toArray()).subscribe((v) => (savingsGoals = v));

		return () => {
			subE.unsubscribe();
			subI.unsubscribe();
			subS.unsubscribe();
		};
	});

	const formatter = $derived(
		new Intl.NumberFormat('en-NG', {
			style: 'currency',
			currency: appStore.settings?.currency || 'NGN',
			maximumFractionDigits: 0
		})
	);

	const activePeriodInfo = $derived.by(() => {
		const p = budgetStore.activePeriod;
		if (!p) return null;
		const dates = getBudgetPeriodDates(p);

		// Days remaining
		const now = new Date();
		const msPerDay = 1000 * 60 * 60 * 24;
		const daysRemaining = Math.max(0, Math.ceil((dates.end.getTime() - now.getTime()) / msPerDay));

		return { ...p, dates, daysRemaining };
	});

	const prog = $derived(budgetStore.spendingProgress);
</script>

<svelte:head>
	<title>Dashboard — Lowo</title>
</svelte:head>

<div class="space-y-6 pb-24 md:pb-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="font-heading text-2xl font-bold tracking-tight">
				Hello, {appStore.settings?.userName || 'there'} 👋
			</h1>
			<p class="text-sm text-muted-foreground">Here's your financial summary.</p>
		</div>
	</div>

	{#if !activePeriodInfo}
		<Card class="border-primary/20 bg-primary/5">
			<CardContent class="space-y-4 p-6 text-center">
				<h3 class="font-medium">No Active Budget</h3>
				<p class="text-sm text-muted-foreground">
					You don't have a budget period active for today.
				</p>
				<Button href="/budgets">Create Budget</Button>
			</CardContent>
		</Card>
	{:else}
		<!-- Main Overview Card -->
		<Card class="relative overflow-hidden border-border bg-gradient-to-br from-card to-card/50">
			<div class="pointer-events-none absolute top-0 right-0 p-4 opacity-10">
				<Wallet class="h-32 w-32" />
			</div>
			<CardContent class="relative z-10 p-6">
				<div class="mb-6 flex items-start justify-between">
					<div>
						<div
							class="mb-2 inline-flex items-center rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary"
						>
							{activePeriodInfo.name}
						</div>
						<p class="text-sm text-muted-foreground">
							{activePeriodInfo.dates.start.toLocaleDateString()} - {activePeriodInfo.dates.end.toLocaleDateString()}
						</p>
					</div>
					<div class="text-right">
						<span class="text-sm font-medium text-muted-foreground"
							>{activePeriodInfo.daysRemaining} days left</span
						>
					</div>
				</div>

				<div class="mt-4">
					<p class="mb-1 text-sm font-medium text-muted-foreground">Total Spent</p>
					<div class="flex items-baseline space-x-2">
						<h2 class="font-mono text-4xl font-bold tracking-tighter">
							{formatter.format(prog.totalSpent)}
						</h2>
						<span class="text-sm text-muted-foreground"
							>out of {formatter.format(prog.totalBudget)}</span
						>
					</div>

					<div class="mt-6 flex items-center space-x-3">
						<Progress value={prog.percentage} max={100} class="h-3 flex-1" />
						<span
							class="text-sm font-medium {prog.percentage > 90
								? 'text-destructive'
								: 'text-primary'}"
						>
							{prog.percentage}%
						</span>
					</div>
				</div>
			</CardContent>
		</Card>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<!-- Category Breakdown -->
			<Card>
				<CardHeader class="flex flex-row items-center justify-between pb-2">
					<CardTitle class="text-base">Top Categories</CardTitle>
					<Button variant="ghost" size="sm" class="text-xs" href="/budgets">View All</Button>
				</CardHeader>
				<CardContent class="space-y-4">
					{#each [...prog.categories].sort((a, b) => b.spent - a.spent).slice(0, 4) as cat}
						<div class="space-y-1.5">
							<div class="flex items-center justify-between text-sm">
								<div class="flex items-center space-x-2">
									<div
										class="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10"
										style="color: {cat.category.color}"
									>
										<DynamicIcon name={cat.category.icon} class="h-3.5 w-3.5" />
									</div>
									<span>{cat.category.name}</span>
								</div>
								<span class="font-mono">{formatter.format(cat.spent)}</span>
							</div>
							<Progress value={cat.percentage} max={100} class="h-1.5" />
						</div>
					{/each}
				</CardContent>
			</Card>

			<!-- Recent Expenses -->
			<Card>
				<CardHeader class="flex flex-row items-center justify-between pb-2">
					<CardTitle class="text-base">Recent Expenses</CardTitle>
					<Button variant="ghost" size="sm" class="text-xs" href="/expenses">All History</Button>
				</CardHeader>
				<CardContent>
					<div class="space-y-4">
						{#each recentExpenses as expense}
							<div class="flex items-center justify-between">
								<div class="flex items-center space-x-3">
									<div
										class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10"
										style="color: {expense.category?.color || 'currentColor'}"
									>
										<DynamicIcon name={expense.category?.icon || 'trending-down'} class="h-4 w-4" />
									</div>
									<div>
										<p class="text-sm font-medium">{expense.notes || 'Expense'}</p>
										<p class="text-xs text-muted-foreground">
											{new Date(expense.date).toLocaleDateString()}
										</p>
									</div>
								</div>
								<span class="font-mono text-sm font-medium text-destructive">
									-{formatter.format(expense.amount)}
								</span>
							</div>
						{:else}
							<p class="py-4 text-center text-sm text-muted-foreground">No recent expenses.</p>
						{/each}
					</div>
				</CardContent>
			</Card>
		</div>
	{/if}

	<!-- Floating Add Button (Mobile Only) since BottomNav handles it, we can keep it out or just rely on BottomNav -->
</div>
