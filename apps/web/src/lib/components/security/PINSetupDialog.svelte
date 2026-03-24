<script lang="ts">
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import * as InputOTP from "$lib/components/ui/input-otp";
  import { Button } from "$lib/components/ui/button";
  import { hashPin } from "$lib/stores/lock.svelte";

  let { open = $bindable(false), onConfirm } = $props<{
    open: boolean;
    onConfirm: (pinHash: string) => void;
  }>();

  let pin = $state("");
  let step = $state(1); // 1: initial, 2: confirm
  let firstPin = $state("");
  let error = $state("");

  function handleComplete(value: string) {
    if (step === 1) {
      firstPin = value;
      pin = "";
      step = 2;
    } else {
      if (value === firstPin) {
        hashPin(value).then(hash => {
          onConfirm(hash);
          reset();
        });
      } else {
        error = "PINs do not match. Try again.";
        pin = "";
        step = 1;
        firstPin = "";
      }
    }
  }

  function reset() {
    pin = "";
    step = 1;
    firstPin = "";
    error = "";
    open = false;
  }
</script>

<AlertDialog.Root bind:open>
  <AlertDialog.Content class="sm:max-w-[400px]">
    <AlertDialog.Header>
      <AlertDialog.Title>
        {step === 1 ? "Set Security PIN" : "Confirm PIN"}
      </AlertDialog.Title>
      <AlertDialog.Description>
        {step === 1 
          ? "Enter a 4-digit PIN to protect your app." 
          : "Please re-enter your PIN to confirm."}
      </AlertDialog.Description>
    </AlertDialog.Header>

    <div class="flex flex-col items-center justify-center py-6 space-y-4">
      <InputOTP.Root
        maxlength={4}
        bind:value={pin}
        onComplete={handleComplete}
      >
        {#snippet children({ cells })}
          <InputOTP.Group>
            {#each cells as cell}
              <InputOTP.Slot {cell} />
            {/each}
          </InputOTP.Group>
        {/snippet}
      </InputOTP.Root>

      {#if error}
        <p class="text-sm font-medium text-destructive animate-in fade-in slide-in-from-top-1">{error}</p>
      {/if}
    </div>

    <AlertDialog.Footer>
      <AlertDialog.Cancel onclick={reset}>Cancel</AlertDialog.Cancel>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
