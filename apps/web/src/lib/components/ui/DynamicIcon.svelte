<script lang="ts">
  import { onMount } from 'svelte';
  // Standard icons we want to support by default to avoid heavy dynamic imports if possible, 
  // but for "dynamic" we can use a record of components.
  import Smartphone from "@lucide/svelte/icons/smartphone";
  import Zap from "@lucide/svelte/icons/zap";
  import Car from "@lucide/svelte/icons/car";
  import ShoppingCart from "@lucide/svelte/icons/shopping-cart";
  import Utensils from "@lucide/svelte/icons/utensils";
  import Church from "@lucide/svelte/icons/church";
  import Home from "@lucide/svelte/icons/home";
  import Users from "@lucide/svelte/icons/users";
  import PiggyBank from "@lucide/svelte/icons/piggy-bank";
  import Wallet from "@lucide/svelte/icons/wallet";
  import Target from "@lucide/svelte/icons/target";
  import CreditCard from "@lucide/svelte/icons/credit-card";
  import Banknote from "@lucide/svelte/icons/banknote";
  import HelpCircle from "@lucide/svelte/icons/help-circle";

  const iconMap: Record<string, any> = {
    smartphone: Smartphone,
    zap: Zap,
    car: Car,
    "shopping-cart": ShoppingCart,
    utensils: Utensils,
    church: Church,
    home: Home,
    users: Users,
    "piggy-bank": PiggyBank,
    wallet: Wallet,
    target: Target,
    "credit-card": CreditCard,
    banknote: Banknote
  };

  let { name, class: className = "w-5 h-5" } = $props<{ name: string; class?: string }>();
  
  const IconComponent = $derived(iconMap[name] || HelpCircle);
</script>

<IconComponent class={className} />
