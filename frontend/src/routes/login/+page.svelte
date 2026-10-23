<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { ApiError } from '$lib/api';
  import { login, loadCurrentUser } from '$lib/stores/auth';
  import AuthShell from '$lib/components/AuthShell.svelte';
  import TextField from '$lib/components/TextField.svelte';
  import Button from '$lib/components/Button.svelte';
  import Alert from '$lib/components/Alert.svelte';

  let email = $state('');
  let password = $state('');
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

    if (!email.trim() || !password) {
      error = 'Email dan password wajib diisi.';
      return;
    }

    submitting = true;
    try {
      await login(email.trim(), password);
      await goto('/dashboard', { replaceState: true });
    } catch (err) {
      error = err instanceof ApiError ? err.message : 'Terjadi kesalahan. Coba lagi.';
    } finally {
      submitting = false;
    }
  }
</script>

<AuthShell title="Masuk" subtitle="Selamat datang kembali! Silakan masuk ke akun Anda.">
  {#if checking}
    <p class="text-center text-sm text-slate-500">Memeriksa sesi...</p>
  {:else}
    <form onsubmit={handleSubmit} class="space-y-4" novalidate>
      {#if error}
        <Alert type="error" message={error} dismissible onclose={() => (error = '')} />
      {/if}

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
        placeholder="••••••••"
        autocomplete="current-password"
        required
        disabled={submitting}
      />

      <Button type="submit" full loading={submitting}>Masuk</Button>
    </form>
  {/if}

  {#snippet footer()}
    Belum punya akun?
    <a href="/register" class="font-medium text-indigo-600 hover:text-indigo-500">Daftar di sini</a>
  {/snippet}
</AuthShell>
