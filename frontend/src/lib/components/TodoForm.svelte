<script lang="ts">
  import TextField from './TextField.svelte';
  import Button from './Button.svelte';

  interface Values {
    title: string;
    description: string;
  }

  interface Props {
    initial?: Values | null;
    submitting?: boolean;
    submitLabel?: string;
    onsubmit: (values: Values) => void;
    oncancel?: () => void;
  }

  let {
    initial = null,
    submitting = false,
    submitLabel = 'Tambah',
    onsubmit,
    oncancel,
  }: Props = $props();

  let title = $state(initial?.title ?? '');
  let description = $state(initial?.description ?? '');
  let titleError = $state('');

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (!title.trim()) {
      titleError = 'Judul wajib diisi';
      return;
    }

    titleError = '';
    onsubmit({ title: title.trim(), description: description.trim() });
  }
</script>

<form onsubmit={handleSubmit} class="space-y-3" novalidate>
  <TextField
    label="Judul"
    bind:value={title}
    placeholder="Apa yang ingin dikerjakan?"
    required
    error={titleError}
    disabled={submitting}
  />

  <TextField
    label="Deskripsi (opsional)"
    bind:value={description}
    placeholder="Detail tambahan..."
    disabled={submitting}
  />

  <div class="flex gap-2">
    <Button type="submit" loading={submitting}>{submitLabel}</Button>

    {#if oncancel}
      <Button variant="secondary" onclick={oncancel} disabled={submitting}>Batal</Button>
    {/if}
  </div>
</form>
