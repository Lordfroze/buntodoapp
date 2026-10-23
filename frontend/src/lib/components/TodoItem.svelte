<script lang="ts">
  import type { Todo } from '$lib/api';
  import Button from './Button.svelte';

  interface Props {
    todo: Todo;
    busy?: boolean;
    onToggle: (todo: Todo) => void;
    onEdit: (todo: Todo) => void;
    onDelete: (todo: Todo) => void;
  }

  let { todo, busy = false, onToggle, onEdit, onDelete }: Props = $props();

  const createdAt = $derived(
    new Date(todo.createdAt).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  );
</script>

<li class="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
  <input
    type="checkbox"
    class="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
    checked={todo.isCompleted}
    disabled={busy}
    onchange={() => onToggle(todo)}
    aria-label={todo.isCompleted ? 'Tandai belum selesai' : 'Tandai selesai'}
  />

  <div class="min-w-0 flex-1">
    <p
      class="break-words font-medium text-slate-900 {todo.isCompleted
        ? 'text-slate-400 line-through'
        : ''}"
    >
      {todo.title}
    </p>

    {#if todo.description}
      <p class="mt-0.5 break-words text-sm text-slate-500 {todo.isCompleted ? 'line-through' : ''}">
        {todo.description}
      </p>
    {/if}

    <p class="mt-1 text-xs text-slate-400">Dibuat {createdAt}</p>
  </div>

  <div class="flex shrink-0 gap-1">
    <Button variant="ghost" size="sm" onclick={() => onEdit(todo)} disabled={busy}>Edit</Button>
    <Button variant="ghost" size="sm" onclick={() => onDelete(todo)} disabled={busy}>
      <span class="text-red-600">Hapus</span>
    </Button>
  </div>
</li>
