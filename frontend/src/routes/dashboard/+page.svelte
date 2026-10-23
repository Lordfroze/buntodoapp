<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { api, ApiError, type Todo } from '$lib/api';
  import { currentUser, loadCurrentUser, logout } from '$lib/stores/auth';
  import type { Filter } from '$lib/types';
  import Button from '$lib/components/Button.svelte';
  import Alert from '$lib/components/Alert.svelte';
  import Spinner from '$lib/components/Spinner.svelte';
  import TodoForm from '$lib/components/TodoForm.svelte';
  import TodoItem from '$lib/components/TodoItem.svelte';
  import FilterTabs from '$lib/components/FilterTabs.svelte';
  import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';

  let todos = $state<Todo[]>([]);
  let loading = $state(true);
  let error = $state('');
  let success = $state('');

  let filter = $state<Filter>('all');
  let showCreate = $state(false);
  let creating = $state(false);

  let editing = $state<Todo | null>(null);
  let savingEdit = $state(false);

  let togglingId = $state<string | null>(null);

  let deleting = $state<Todo | null>(null);
  let deleteBusy = $state(false);
  let loggingOut = $state(false);

  const filtered = $derived(
    filter === 'active'
      ? todos.filter((todo) => !todo.isCompleted)
      : filter === 'completed'
        ? todos.filter((todo) => todo.isCompleted)
        : todos
  );

  const counts = $derived({
    all: todos.length,
    active: todos.filter((todo) => !todo.isCompleted).length,
    completed: todos.filter((todo) => todo.isCompleted).length,
  });

  let flashTimer: ReturnType<typeof setTimeout> | undefined;

  function flash(message: string) {
    success = message;
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => (success = ''), 3500);
  }

  function reportError(err: unknown, fallback: string) {
    error = err instanceof ApiError ? err.message : fallback;
  }

  async function handleUnauthorized(err: unknown): Promise<boolean> {
    if (err instanceof ApiError && err.status === 401) {
      await goto('/login', { replaceState: true });
      return true;
    }
    return false;
  }

  async function fetchTodos() {
    loading = true;
    error = '';
    try {
      todos = await api.listTodos();
    } catch (err) {
      if (await handleUnauthorized(err)) return;
      reportError(err, 'Gagal memuat daftar todo.');
    } finally {
      loading = false;
    }
  }

  onMount(async () => {
    const user = await loadCurrentUser();
    if (!user) {
      await goto('/login', { replaceState: true });
      return;
    }
    await fetchTodos();
  });

  async function handleCreate(values: { title: string; description: string }) {
    creating = true;
    error = '';
    try {
      const created = await api.createTodo(values);
      todos = [created, ...todos];
      showCreate = false;
      flash('Todo berhasil ditambahkan.');
    } catch (err) {
      if (await handleUnauthorized(err)) return;
      reportError(err, 'Gagal menambahkan todo.');
    } finally {
      creating = false;
    }
  }

  async function handleSaveEdit(values: { title: string; description: string }) {
    if (!editing) return;
    savingEdit = true;
    error = '';
    try {
      const updated = await api.updateTodo(editing.id, values);
      todos = todos.map((todo) => (todo.id === updated.id ? updated : todo));
      editing = null;
      flash('Todo berhasil diperbarui.');
    } catch (err) {
      if (await handleUnauthorized(err)) return;
      reportError(err, 'Gagal memperbarui todo.');
    } finally {
      savingEdit = false;
    }
  }

  async function handleToggle(todo: Todo) {
    togglingId = todo.id;
    error = '';
    try {
      const updated = await api.updateTodo(todo.id, { isCompleted: !todo.isCompleted });
      todos = todos.map((item) => (item.id === updated.id ? updated : item));
    } catch (err) {
      if (await handleUnauthorized(err)) return;
      reportError(err, 'Gagal memperbarui status todo.');
    } finally {
      togglingId = null;
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    deleteBusy = true;
    error = '';
    try {
      await api.deleteTodo(deleting.id);
      todos = todos.filter((todo) => todo.id !== deleting?.id);
      deleting = null;
      flash('Todo berhasil dihapus.');
    } catch (err) {
      if (await handleUnauthorized(err)) return;
      reportError(err, 'Gagal menghapus todo.');
    } finally {
      deleteBusy = false;
    }
  }

  async function handleLogout() {
    loggingOut = true;
    try {
      await logout();
      await goto('/login', { replaceState: true });
    } finally {
      loggingOut = false;
    }
  }
</script>

<div class="min-h-screen bg-slate-50">
  <header class="border-b border-slate-200 bg-white">
    <div
      class="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6"
    >
      <div class="flex items-center gap-3">
        <div
          class="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M5 12.5l4.5 4.5L19 7.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-slate-900">Todo App</p>
          <p class="truncate text-xs text-slate-500">
            Halo, {$currentUser?.name ?? 'Pengguna'}
          </p>
        </div>
      </div>

      <Button variant="secondary" size="sm" onclick={handleLogout} loading={loggingOut}>
        Keluar
      </Button>
    </div>
  </header>

  <main class="mx-auto max-w-3xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-xl font-semibold text-slate-900">Daftar Todo</h1>
        <p class="text-sm text-slate-500">Kelola tugas pribadi Anda.</p>
      </div>

      <Button onclick={() => (showCreate = !showCreate)}>
        {showCreate ? 'Tutup' : '+ Todo Baru'}
      </Button>
    </div>

    {#if error}
      <Alert type="error" message={error} dismissible onclose={() => (error = '')} />
    {/if}
    {#if success}
      <Alert type="success" message={success} dismissible onclose={() => (success = '')} />
    {/if}

    {#if showCreate}
      <section class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 class="mb-3 text-sm font-semibold text-slate-900">Tambah todo baru</h2>
        <TodoForm onsubmit={handleCreate} submitting={creating} submitLabel="Tambah Todo" oncancel={() => (showCreate = false)} />
      </section>
    {/if}

    <FilterTabs value={filter} {counts} onchange={(value) => (filter = value)} />

    <section>
      {#if loading}
        <div class="flex items-center justify-center gap-2 rounded-2xl bg-white py-14 text-sm text-slate-500 ring-1 ring-slate-200">
          <Spinner size={20} class="text-indigo-600" />
          Memuat todo...
        </div>
      {:else if filtered.length === 0}
        <div class="rounded-2xl bg-white px-6 py-14 text-center ring-1 ring-slate-200">
          <p class="text-sm font-medium text-slate-700">
            {#if todos.length === 0}
              Belum ada todo.
            {:else if filter === 'active'}
              Tidak ada todo yang aktif.
            {:else}
              Belum ada todo yang selesai.
            {/if}
          </p>
          <p class="mt-1 text-sm text-slate-500">
            {#if todos.length === 0}
              Tambahkan todo pertama Anda untuk memulai.
            {:else}
              Coba ubah filter atau tambahkan todo baru.
            {/if}
          </p>
        </div>
      {:else}
        <ul class="space-y-3">
          {#each filtered as todo (todo.id)}
            <TodoItem
              {todo}
              busy={togglingId === todo.id}
              onToggle={handleToggle}
              onEdit={(item) => (editing = item)}
              onDelete={(item) => (deleting = item)}
            />
          {/each}
        </ul>
      {/if}
    </section>
  </main>
</div>

{#if editing}
  {#key editing.id}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        role="presentation"
        onclick={() => !savingEdit && (editing = null)}
      ></div>

      <div
        class="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label="Edit todo"
      >
        <h2 class="text-lg font-semibold text-slate-900">Edit Todo</h2>
        <div class="mt-4">
          <TodoForm
            initial={{ title: editing.title, description: editing.description ?? '' }}
            submitting={savingEdit}
            submitLabel="Simpan Perubahan"
            onsubmit={handleSaveEdit}
            oncancel={() => (editing = null)}
          />
        </div>
      </div>
    </div>
  {/key}
{/if}

<ConfirmDialog
  open={deleting !== null}
  title="Hapus todo?"
  message={deleting ? `Todo "${deleting.title}" akan dihapus permanen.` : ''}
  confirmLabel="Hapus"
  loading={deleteBusy}
  onconfirm={confirmDelete}
  oncancel={() => (deleting = null)}
/>
