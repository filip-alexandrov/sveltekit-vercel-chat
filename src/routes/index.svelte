<script context="module">
	import { browser } from '$app/env';
	import { onAuthStateChanged } from 'firebase/auth';
	import { auth } from '$lib/services/firebase';
	import { goto } from '$app/navigation';

	let noUser = false;
	if (browser) {
		onAuthStateChanged(auth, (user) => {
			if (user) {
				console.log('user found');
				const uid = user.uid;
				goto('/chat');
			}
		});
		noUser = true;
	}
</script>

<script lang="ts">
	import Auth from '$lib/components/Auth.svelte';
</script>

{#if noUser}
	<h1 class="w3-jumbo w3-center">Serverless Chat</h1>
	<p class="w3-large w3-center">Please log in</p>

	<Auth on:auth={() => goto('/chat')} />
{/if}
