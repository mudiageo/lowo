<script lang="ts">
  import { appStore } from "$lib/stores/app.svelte";
  import ResponsiveFormModal from "$lib/components/layout/ResponsiveFormModal.svelte";
  import ExpenseForm from "$lib/components/features/expense/ExpenseForm.svelte";
</script>

<ResponsiveFormModal
  title="Quick Log Expense"
  description="Add a new transaction instantly from anywhere."
  bind:open={appStore.showQuickAdd}
>
  <ExpenseForm onSaveSuccess={() => appStore.showQuickAdd = false} />
</ResponsiveFormModal>
