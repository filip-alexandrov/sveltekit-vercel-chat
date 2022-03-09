<script lang="ts">
	import { goto } from '$app/navigation';
	import Auth from '$lib/components/Auth.svelte';
</script>

<h1 class="w3-jumbo w3-center">Serverless Chat</h1>
<p class="w3-large w3-center">Please log in</p>

<Auth on:auth={() => goto('/chat')} />
