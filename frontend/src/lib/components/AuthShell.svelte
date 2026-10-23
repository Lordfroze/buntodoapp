<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    subtitle?: string;
    children: Snippet;
    footer?: Snippet;
  }

  let { title, subtitle, children, footer }: Props = $props();
</script>

<div class="flex min-h-screen items-center justify-center px-4 py-10">
  <div class="w-full max-w-md">
    <div class="mb-6 flex flex-col items-center text-center">
      <div
        class="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" class="h-7 w-7" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M5 12.5l4.5 4.5L19 7.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <h1 class="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
      {#if subtitle}
        <p class="mt-1 text-sm text-slate-500">{subtitle}</p>
      {/if}
    </div>

    <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
      {@render children()}
    </div>

    {#if footer}
      <div class="mt-5 text-center text-sm text-slate-500">
        {@render footer()}
      </div>
    {/if}
  </div>
</div>
