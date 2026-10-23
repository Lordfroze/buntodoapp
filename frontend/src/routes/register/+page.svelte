<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { ApiError } from '$lib/api';
  import { register, loadCurrentUser } from '$lib/stores/auth';
  import AuthShell from '$lib/components/AuthShell.svelte';
  import TextField from '$lib/components/TextField.svelte';
  import Button from '$lib/components/Button.svelte';
  import Alert from '$lib/components/Alert.svelte';

  let name = $state('');
  let email = $state('');
  let password = $state('');
  let confirmPassword = $state('');
  let error = $state('');
  let submitting = $state(false);
  let checking = $state(true);

  onMount(async () => {
    const user = await loadCurrentUser();
    if (user) {
      await goto('/dashboard', { replaceState: true });
      return;
    }
    checking = false;
  });

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    error = '';

    if (name.trim().length < 2) {
      error = 'Nama minimal 2 karakter.';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      error = 'Format email tidak valid.';
      return;
    }
    if (password.length < 6) {
      error = 'Password minimal 6 karakter.';
      return;
    }
    if (password !== confirmPassword) {
      error = 'Konfirmasi password tidak cocok.';
      return;
    }

    submitting = true;
    try {
      await register(name.trim(), email.trim(), password);
      await goto('/dashboard', { replaceState: true });
    } catch (err) {
      error = err instanceof ApiError ? err.message : 'Terjadi kesalahan. Coba lagi.';
    } finally {
      submitting = false;
    }
  }
</script>

<AuthShell title="Buat Akun" subtitle="Daftar untuk mulai mengelola todo Anda.">
  {#if checking}
    <p class="text-center text-sm text-slate-500">Memeriksa sesi...</p>
  {:else}
    <form onsubmit={handleSubmit} class="space-y-4" novalidate>
      {#if error}
        <Alert type="error" message={error} dismissible onclose={() => (error = '')} />
      {/if}

      <TextField
        label="Nama"
        name="name"
        bind:value={name}
        placeholder="Nama lengkap"
        autocomplete="name"
        required
        disabled={submitting}
      />

      <TextField
        label="Email"
        name="email"
        type="email"
        bind:value={email}
        placeholder="nama@email.com"
        autocomplete="email"
        required
        disabled={submitting}
      />

      <TextField
        label="Password"
        name="password"
        type="password"
        bind:value={password}
        placeholder="Minimal 6 karakter"
        autocomplete="new-password"
        required
        disabled={submitting}
      />

      <TextField
        label="Konfirmasi Password"
        name="confirmPassword"
        type="password"
        bind:value={confirmPassword}
        placeholder="Ulangi password"
        autocomplete="new-password"
        required
        disabled={submitting}
      />

      <Button type="submit" full loading={submitting}>Daftar</Button>
    </form>
  {/if}

  {#snippet footer()}
    Sudah punya akun?
    <a href="/login" class="font-medium text-indigo-600 hover:text-indigo-500">Masuk di sini</a>
  {/snippet}
</AuthShell>
