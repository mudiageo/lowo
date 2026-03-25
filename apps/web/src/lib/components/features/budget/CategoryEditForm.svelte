<script lang="ts">
	import { db } from '$lib/db';
	import type { BudgetCategory } from '$lib/db/schema';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import Save from '@lucide/svelte/icons/save';

	let { category, onSaveSuccess } = $props<{
		category: BudgetCategory;
		onSaveSuccess: () => void;
	}>();

	let name = $derived(category.name);
	let allocatedAmount = $derived(category.allocatedAmount);
	let color = $derived(category.color);
	let isSaving = $state(false);

	async function handleSave() {
		isSaving = true;
		try {
			await db.budgetCategories.update(category.id, {
				name,
				allocatedAmount,
				color
			});
			onSaveSuccess();
		} catch (e) {
			console.error('Failed to update category:', e);
			alert('Failed to update category.');
		} finally {
			isSaving = false;
		}
	}
</script>

<form
	onsubmit={(e) => {
		e.preventDefault();
		handleSave();
	}}
	class="space-y-4 pt-4"
>
	<div class="space-y-2">
		<Label for="cat-name">Category Name</Label>
		<Input id="cat-name" bind:value={name} required />
	</div>

	<div class="space-y-2">
		<Label for="cat-amount">Allocated Amount</Label>
		<Input id="cat-amount" type="number" bind:value={allocatedAmount} required min="0" />
	</div>

	<div class="space-y-2">
		<Label for="cat-color">Color</Label>
		<div class="flex items-center gap-3">
			<Input id="cat-color" type="color" bind:value={color} class="h-10 w-12 p-1" />
			<span class="font-mono text-sm uppercase">{color}</span>
		</div>
	</div>

	<div class="pt-4">
		<Button type="submit" class="w-full" disabled={isSaving}>
			<Save class="mr-2 h-4 w-4" />
			{isSaving ? 'Saving...' : 'Save Changes'}
		</Button>
	</div>
</form>
