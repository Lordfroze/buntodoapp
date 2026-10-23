<script lang="ts">
  import Button from './Button.svelte';

  interface Props {
    open: boolean;
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
    onconfirm: () => void;
    oncancel: () => void;
  }

  let {
    open,
    title = 'Konfirmasi',
    message = 'Apakah Anda yakin?',
    confirmLabel = 'Ya, lanjutkan',
    cancelLabel = 'Batal',
    loading = false,
    onconfirm,
    oncancel,
  }: Props = $props();
</script>

{#if open}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div
      class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      role="presentation"
      onclick={() => !loading && oncancel()}
    ></div>

    <div
      class="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <h2 class="text-lg font-semibold text-slate-900">{title}</h2>
      <p class="mt-2 text-sm text-slate-600">{message}</p>

      <div class="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onclick={oncancel} disabled={loading}>{cancelLabel}</Button>
        <Button variant="danger" onclick={onconfirm} {loading}>{confirmLabel}</Button>
      </div>
    </div>
  </div>
{/if}
