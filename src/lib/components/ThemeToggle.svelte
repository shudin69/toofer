<script lang="ts">
	import { getEffectiveTheme, toggleTheme, initThemeListener, type Theme } from '$lib/theme';
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';

	// Initialize from current effective theme (avoids mismatch with inline script)
	let theme = $state<Theme>('dark');

	// Sync with actual theme on mount and listen for system changes
	$effect(() => {
		theme = getEffectiveTheme();

		const cleanup = initThemeListener((newTheme) => {
			theme = newTheme;
		});

		return cleanup;
	});

</script>

<button
	class="theme-toggle"
	onclick={() => { theme = toggleTheme(); }}
	aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
>
	{#if theme === 'dark'}
		<Sun size={20} aria-hidden="true" />
	{:else}
		<Moon size={20} aria-hidden="true" />
	{/if}
</button>

<style>
	.theme-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		background: transparent;
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		color: var(--text-secondary);
		cursor: pointer;
		transition: background-color 0.2s, color 0.2s, border-color 0.2s;
	}

	.theme-toggle:hover {
		background: var(--border);
		color: var(--text-primary);
	}

	.theme-toggle:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	@media (prefers-reduced-motion: reduce) {
		.theme-toggle {
			transition: none;
		}
	}
</style>
