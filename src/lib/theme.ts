import { browser } from '$app/environment';

const STORAGE_KEY = 'theme';

export type Theme = 'light' | 'dark';

function getSystemTheme(): Theme {
	if (!browser) return 'dark';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme | null {
	if (!browser) return null;
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === 'light' || stored === 'dark') return stored;
	return null;
}

function applyTheme(theme: Theme) {
	if (!browser) return;
	document.documentElement.dataset.theme = theme;
	document.documentElement.style.colorScheme = theme;
}

export function getEffectiveTheme(): Theme {
	return getStoredTheme() ?? getSystemTheme();
}

export function isSystemMode(): boolean {
	return getStoredTheme() === null;
}

export function setTheme(theme: Theme) {
	if (!browser) return;

	const systemTheme = getSystemTheme();

	// If setting to match system, clear storage to track system
	if (theme === systemTheme) {
		localStorage.removeItem(STORAGE_KEY);
	} else {
		localStorage.setItem(STORAGE_KEY, theme);
	}

	applyTheme(theme);
}

export function toggleTheme(): Theme {
	const current = getEffectiveTheme();
	const next: Theme = current === 'dark' ? 'light' : 'dark';
	setTheme(next);
	return next;
}

export function initThemeListener(callback: (theme: Theme) => void) {
	if (!browser) return () => {};

	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

	const handler = (e: MediaQueryListEvent) => {
		// Only react to system changes if in system mode
		if (isSystemMode()) {
			const theme = e.matches ? 'dark' : 'light';
			applyTheme(theme);
			callback(theme);
		}
	};

	mediaQuery.addEventListener('change', handler);
	return () => mediaQuery.removeEventListener('change', handler);
}
