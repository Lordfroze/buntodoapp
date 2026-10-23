<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { loadCurrentUser } from '$lib/stores/auth';
  import Spinner from '$lib/components/Spinner.svelte';

  onMount(async () => {
    const user = await loadCurrentUser();
    await goto(user ? '/dashboard' : '/login', { replaceState: true });
  });
</script>

<div class="flex min-h-screen items-center justify-center">
  <Spinner size={32} class="text-indigo-600" />
</div>
