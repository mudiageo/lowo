<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Drawer from "$lib/components/ui/drawer";
  import { onMount } from "svelte";

  let { title, description, open = $bindable(false), children } = $props<{
    title: string;
    description: string;
    open: boolean;
    children: any;
  }>();

  let isDesktop = $state(true);
  
  onMount(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    isDesktop = mql.matches;
    const handler = (e: MediaQueryListEvent) => isDesktop = e.matches;
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  });
</script>

{#if isDesktop}
  <Dialog.Root bind:open>
    <Dialog.Content class="sm:max-w-lg">
      <Dialog.Header>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Description>{description}</Dialog.Description>
      </Dialog.Header>
      <div class="py-4">
        {@render children()}
      </div>
    </Dialog.Content>
  </Dialog.Root>
{:else}
  <Drawer.Root bind:open>
    <Drawer.Content>
      <Drawer.Header>
        <Drawer.Title>{title}</Drawer.Title>
        <Drawer.Description>{description}</Drawer.Description>
      </Drawer.Header>
      <div class="px-4 pb-8 pt-2">
        {@render children()}
      </div>
    </Drawer.Content>
  </Drawer.Root>
{/if}
