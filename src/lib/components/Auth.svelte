<script lang="ts">
	import { fade } from 'svelte/transition';
	import ErrorAlert from './ErrorAlert.svelte';
	import { createEventDispatcher } from 'svelte';
	import {
		createUserWithEmailAndPassword,
		signInWithEmailAndPassword,
		GoogleAuthProvider,
		signInWithPopup,
		signOut,
		onAuthStateChanged
	} from 'firebase/auth';
	import { browser } from '$app/env';
	import { auth } from '$lib/services/firebase';
	import { goto } from '$app/navigation';

	if (browser) {
		onAuthStateChanged(auth, (user) => {
			if (user) {
				const uid = user.uid;
				goto('/chat');
			} else {
				goto('/');
			}
		});
	}

	const d = createEventDispatcher();
	const provider = new GoogleAuthProvider();

	// for registration
	let email = '';
	let password = '';
	let cpassword = '';

	// for login
	let loginEmail = 'yohandentzki@gmail.com';
	let loginPassword = '000000';

	export let authMode: 'login' | 'register' = 'register';
	let isAuthenticated = false;
	let err: string | null = null;

	function login() {
		if (!loginEmail || !loginPassword) {
			err = 'Fill out all fields!';
			loginPassword = '';
			return;
		}
		err = '';

		signInWithEmailAndPassword(auth, loginEmail, loginPassword)
			.then((userCredential) => {
				d('done');
				d('auth');
				const user = userCredential.user;
				loginEmail = '';
				loginPassword = '';
			})
			.catch((error) => {
				const errorCode = error.code;
				const errorMessage = error.message;

				loginPassword = '';
				err = `(${errorCode}) ${errorMessage}`;
			});
	}

	function register() {
		if (!email || !password || !cpassword) {
			err = 'Fill out all fields!';
			return;
		}
		if (password !== cpassword) {
			err = "Passwords don't match!";
			return;
		}
		err = '';

		createUserWithEmailAndPassword(auth, email, password)
			.then((userCredential) => {
				d('done');
				d('auth');

				email = '';
				password = '';
				cpassword = '';
			})
			.catch((error) => {
				const errorCode = error.code;
				const errorMessage = error.message;
				err = `(${errorCode}) ${errorMessage}`;

				password = '';
				cpassword = '';
			});
	}
	function logout() {
		signOut(auth)
			.then(() => {
				d('done');
				d('logout');
			})
			.catch((error) => {
				throw new Error(error);
			});
	}

	function google() {
		signInWithPopup(auth, provider)
			.then((result) => {
				// This gives you a Google Access Token. You can use it to access the Google API.
				const credential = GoogleAuthProvider.credentialFromResult(result);
				const token = credential.accessToken;
				// The signed-in user info.
				const user = result.user;
				d('auth');
				d('done');
			})
			.catch((error) => {
				// Handle Errors here.
				const errorCode = error.code;
				const errorMessage = error.message;
				// The email of the user's account used.
				const email = error.email;
				// The AuthCredential type that was used.
				const credential = GoogleAuthProvider.credentialFromError(error);
				err = `(${errorCode}) ${errorMessage}`;
			});
	}
</script>

<div class="w3-card-4" style="width: 40%; margin: 1rem auto">
	{#if !isAuthenticated}
		<div class="w3-container">
			<h2 class="w3-center">{authMode === 'login' ? 'Login' : 'Register'} to Serverless Chat</h2>
		</div>
		<div class="w3-container">
			<div class="w3-bar w3-center w3-border-bottom w3-border-gray w3-text-dark-gray">
				<button
					on:click={() => (authMode = 'login')}
					class="w3-bar-item w3-button w3-text-center {authMode === 'login' && 'w3-blue'}"
					style="width: 50%">LOGIN</button
				>
				<button
					on:click={() => (authMode = 'register')}
					class="w3-bar-item w3-button w3-text-center {authMode === 'register' && 'w3-blue'}"
					style="width: 50%">REGISTER</button
				>
			</div>
			<!-- Email login/register forms -->
			{#if authMode === 'login'}
				<form in:fade on:submit|preventDefault={login}>
					{#if err}
						<ErrorAlert message={err} />
					{/if}
					<h4>Login</h4>
					<p>
						<label for="l-email">Email</label>
						<input
							bind:value={loginEmail}
							type="email"
							class="w3-input w3-border"
							placeholder="Enter your email"
							id="l-email"
						/>
					</p>
					<p>
						<label for="l-password">Password</label>
						<input
							bind:value={loginPassword}
							type="password"
							class="w3-input w3-border"
							placeholder="Enter your password"
							id="l-password"
						/>
					</p>
					<p>
						<button type="submit" class="w3-button w3-blue">Login</button>
					</p>
				</form>
			{:else}
				<form in:fade on:submit|preventDefault={register}>
					{#if err}
						<ErrorAlert message={err} />
					{/if}
					<h4>Register</h4>
					<p>
						<label for="r-email">Email</label>
						<input
							bind:value={email}
							type="email"
							class="w3-input w3-border"
							placeholder="Enter your email"
							id="r-email"
						/>
					</p>
					<p>
						<label for="r-password">Password</label>
						<input
							bind:value={password}
							type="password"
							class="w3-input w3-border"
							placeholder="Enter a password"
							id="r-password"
						/>
					</p>
					<p>
						<label for="r-cpassword">Confirm Password</label>
						<input
							bind:value={cpassword}
							type="password"
							class="w3-input w3-border"
							placeholder="Re-enter that password"
							id="r-cpassword"
						/>
					</p>
					<p>
						<button type="submit" class="w3-button w3-blue">Register</button>
					</p>
				</form>
			{/if}
			<hr />
			<p>
				<button class="w3-button w3-blue" style="width: 100%" on:click={google}
					><i class="fab fa-google" /> Sign in with Google</button
				>
			</p>
		</div>
	{:else}
		<div class="w3-container">
			<h2>Logged in</h2>
		</div>
		<div class="w3-container">
			<p class="w3-large w3-text-green w3-center"><i class="fas fa-check fa-5x" /></p>
			<p class="w3-center">Logged in</p>
			<p>
				<button class="w3-button w3-blue" style="width: 100%" on:click={logout}>Log out</button>
			</p>
		</div>
	{/if}
</div>
