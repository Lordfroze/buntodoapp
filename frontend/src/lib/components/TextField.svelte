<script lang="ts">
  interface Props {
    label?: string;
    id?: string;
    name?: string;
    type?: string;
    value?: string;
    placeholder?: string;
    autocomplete?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    hint?: string;
  }

  let {
    label,
    id,
    name,
    type = 'text',
    value = $bindable(''),
    placeholder,
    autocomplete,
    required = false,
    disabled = false,
    error,
    hint,
  }: Props = $props();

  const inputId = id ?? name ?? `field-${Math.random().toString(36).slice(2, 9)}`;
  const describedBy = $derived(error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined);
</script>

<div class="space-y-1.5">
  {#if label}
    <label for={inputId} class="block text-sm font-medium text-slate-700">{label}</label>
  {/if}

  <input
    id={inputId}
    {name}
    {type}
    bind:value
    {placeholder}
    {autocomplete}
    {required}
    {disabled}
    aria-invalid={error ? 'true' : undefined}
    aria-describedby={describedBy}
    class="block w-full rounded-lg border-0 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 transition placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-50 {error
      ? 'ring-red-500 focus:ring-red-500'
      : ''}"
  />

  {#if error}
    <p id="{inputId}-error" class="text-xs text-red-600">{error}</p>
  {:else if hint}
    <p id="{inputId}-hint" class="text-xs text-slate-500">{hint}</p>
  {/if}
</div>
