<script lang="ts">
	import { goto } from '$app/navigation';
	import { auth, db } from '$lib/services/firebase';
	import { onAuthStateChanged, signOut } from 'firebase/auth';
	import { browser } from '$app/env';
	import { onSnapshot, collection, query, addDoc } from 'firebase/firestore';
	import { onDestroy } from 'svelte';
	import Filter from 'bad-words';
	import Chat from '$lib/components/Chat.svelte';

	const q = query(collection(db, 'messages'));
	const unsubscribe = onSnapshot(q, (snapshot) => {
		snapshot.docChanges().forEach((change) => {
			if (change.type === 'added') {
				messages = [...messages, change.doc.data() as Message];
				setTimeout(() => {
					if (document.getElementById('scroll-to'))
						document.getElementById('scroll-to').scrollIntoView({ behavior: 'smooth' });
				}, 500);
			}
			if (change.type === 'modified') {
				console.log('Modified city: ', change.doc.data());
			}
			if (change.type === 'removed') {
				console.log('Removed city: ', change.doc.data());
			}
		});
	});
	onDestroy(unsubscribe);

	interface User {
		email: string;
		photoURL: string;
		uid: string;
	}
	let user: User | null;

	interface Message extends User {
		message: string;
		createdAt: number;
	}
	let messages: Message[] = [];
	let cooldown = false;

	async function messageSubmit(
		e: KeyboardEvent & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) {
		if (e.key.toLowerCase() !== 'enter') return;
		if (cooldown) return;
		const message = new Filter().clean(
			((document.getElementById('message-input') as HTMLInputElement).value || '').trim()
		);
		if (!message) return;

		(document.getElementById('message-input') as HTMLInputElement).value = '';
		cooldown = true;
		setTimeout(() => (cooldown = false), 3000);

		const docRef = await addDoc(collection(db, 'messages'), {
			message,
			email: user.email,
			photoURL: user.photoURL,
			uid: user.uid,
			createdAt: Date.now()
		});
	}

	if (browser) {
		onAuthStateChanged(auth, (u) => {
			if (u) {
				console.log(u);
				user = {
					email: u.email,
					uid: u.uid,
					photoURL: u.photoURL
				};
			} else {
				goto('/');
			}
		});
	}

	let err = '';
	function logout() {
		signOut(auth)
			.then(() => {
				goto('/');
			})
			.catch((error) => {
				err = error;
			});
	}
</script>

<p>{err}</p>

{#if typeof user === 'undefined'}
	<p class="w3-center w3-section"><i class="fas fa-spinner w3-spin fa-3x" /> Loading</p>
{:else if user}
	<h1 class="w3-jumbo w3-center">Serverless chat</h1>
	<p class="w3-center">Chatroom</p>
	<p class="w3-center"><button class="w3-button w3-blue" on:click={logout}>Logout</button></p>

	<br />
	<div
		class="w3-container w3-border w3-border-gray"
		style="margin: 0 auto; width: 60%; height: 600px; overflow-y: auto;"
	>
		<br />
		{#if messages.length > 0}
			{#each messages as m}
				<Chat {...m} self={user.uid === m.uid} />
			{/each}
		{:else}
			<p class="w3-center w3-text-gray">Looks like nobody's sent a message. Be the first!</p>
		{/if}
		<!-- Dummy element used to scroll chat -->
		<br id="scroll-to" />
	</div>
	<input
		on:keydown={messageSubmit}
		type="text"
		style="margin: 0 auto; width: 60%; margin-top: -1px"
		placeholder={cooldown ? '3 second cooldown' : 'Enter message and press enter'}
		class="w3-input w3-border w3-border-gray {cooldown && 'w3-pale-red'}"
		id="message-input"
	/>
	<br />
{:else}
	<p class="w3-center w3-section">Not logged in!</p>
{/if}
