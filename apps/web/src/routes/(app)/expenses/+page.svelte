<script lang="ts">
	import { db } from '$lib/db';
	import { budgetStore } from '$lib/stores/budget.svelte';
	import { appStore } from '$lib/stores/app.svelte';
	import { liveQuery } from 'dexie';
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import ResponsiveFormModal from '$lib/components/layout/ResponsiveFormModal.svelte';
	import ExpenseForm from '$lib/components/features/expense/ExpenseForm.svelte';
	import Plus from '@lucide/svelte/icons/plus';
	import Search from '@lucide/svelte/icons/search';
	import Filter from '@lucide/svelte/icons/filter';

	const formatter = $derived(
		new Intl.NumberFormat('en-NG', {
			style: 'currency',
			currency: appStore.settings?.currency || 'NGN',
			maximumFractionDigits: 0
		})
	);

	let isModalOpen = $state(false);

	// Load recent expenses for active period
	let recentExpenses = $derived.by(() => {
		return liveQuery(async () => {
			if (!budgetStore.activePeriodId) return [];
			const expenses = await db.expenses
				.where('budgetPeriodId')
				.equals(budgetStore.activePeriodId)
				.reverse()
				.sortBy('date');

			return Promise.all(
				expenses.map(async (exp) => {
					const cat = await db.budgetCategories.get(exp.categoryId);
					return { ...exp, category: cat };
				})
			);
		});
	});

</script>

<div class="space-y-6 pb-24 md:pb-6">
	<div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
		<div>
			<h1 class="font-heading text-2xl font-bold tracking-tight">Expenses</h1>
			<p class="text-sm text-muted-foreground">Track where your money goes.</p>
		</div>
		<Button onclick={() => isModalOpen = true}>
			<Plus class="mr-2 h-4 w-4" /> Log Expense
		</Button>
	</div>

	<div class="space-y-4">
		<div class="flex items-center space-x-2">
			<div class="relative flex-1">
				<Search class="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
				<Input type="search" placeholder="Search expenses..." class="bg-card pl-9" />
			</div>
			<Button variant="outline" size="icon">
				<Filter class="h-4 w-4" />
			</Button>
		</div>

		<Card>
			<div class="divide-y divide-border">
				{#if $recentExpenses && $recentExpenses.length > 0}
					<div class="max-h-[600px] overflow-y-auto">
						{#each $recentExpenses as expense (expense.id)}
							<div class="flex items-center justify-between p-4 transition-colors hover:bg-muted/50">
								<div class="flex items-center space-x-4">
									<div
										class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"
										style="color: {expense.category?.color || '#888'}"
									>
										<span class="font-bold">{expense.category?.name.charAt(0) || '?'}</span>
									</div>
									<div>
										<p class="text-sm font-medium">{expense.notes || expense.category?.name}</p>
										<div class="mt-0.5 flex items-center space-x-2 text-xs text-muted-foreground">
											<span>{expense.category?.name}</span>
											<span>•</span>
											<span class="capitalize">{expense.paymentMethod.replace('_', ' ')}</span>
										</div>
									</div>
								</div>
								<div class="text-right">
									<p class="font-mono text-sm font-semibold">
										{formatter.format(expense.amount)}
									</p>
									<p class="mt-0.5 text-[10px] tracking-wider text-muted-foreground uppercase">
										{new Date(expense.date).toLocaleDateString(undefined, {
											month: 'short',
											day: 'numeric'
										})}
									</p>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="p-12 text-center text-muted-foreground">
						<p>No expenses logged for this period yet.</p>
					</div>
				{/if}
			</div>
		</Card>
	</div>
</div>

<ResponsiveFormModal
	title="Log Expense"
	description="Quickly add a new transaction manually."
	bind:open={isModalOpen}
>
	<ExpenseForm onSaveSuccess={() => isModalOpen = false} />
</ResponsiveFormModal>
