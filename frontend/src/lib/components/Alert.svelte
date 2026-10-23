<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    type?: 'success' | 'error' | 'info';
    message?: string;
    dismissible?: boolean;
    onclose?: () => void;
    children?: Snippet;
  }

  let { type = 'info', message, dismissible = false, onclose, children }: Props = $props();

  const styles: Record<NonNullable<Props['type']>, string> = {
    success: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    error: 'bg-red-50 text-red-800 ring-red-200',
    info: 'bg-sky-50 text-sky-800 ring-sky-200',
  };
</script>

<div
  role="alert"
  class="flex items-start gap-3 rounded-lg px-4 py-3 text-sm ring-1 ring-inset {styles[type]}"
>
  <div class="flex-1">
    {#if message}<p>{message}</p>{/if}
    {#if children}{@render children()}{/if}
  </div>

  {#if dismissible}
    <button
      type="button"
      class="shrink-0 rounded p-0.5 text-current/70 hover:bg-black/5"
      aria-label="Tutup"
      onclick={() => onclose?.()}
    >
      ✕
    </button>
  {/if}
</div>
