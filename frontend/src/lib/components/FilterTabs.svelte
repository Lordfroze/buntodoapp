<script lang="ts">
  import type { Filter } from '$lib/types';

  interface Props {
    value: Filter;
    counts: Record<Filter, number>;
    onchange: (filter: Filter) => void;
  }

  let { value, counts, onchange }: Props = $props();

  const tabs: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Semua' },
    { key: 'active', label: 'Aktif' },
    { key: 'completed', label: 'Selesai' },
  ];
</script>

<div class="flex gap-1 rounded-lg bg-slate-100 p-1" role="tablist" aria-label="Filter todo">
  {#each tabs as tab (tab.key)}
    <button
      type="button"
      role="tab"
      aria-selected={value === tab.key}
      class="flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors {value === tab.key
        ? 'bg-white text-slate-900 shadow-sm'
        : 'text-slate-500 hover:text-slate-700'}"
      onclick={() => onchange(tab.key)}
    >
      {tab.label}
      <span class="ml-1 text-xs text-slate-400">({counts[tab.key]})</span>
    </button>
  {/each}
</div>
