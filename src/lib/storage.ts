import type { Account, EncryptedVault, VaultInfo } from './types';
import { encrypt, decrypt } from './crypto';

const VAULTS_INDEX_KEY = 'toofer_vaults';
const VAULT_PREFIX = 'toofer_vault_';
const LEGACY_STORAGE_KEY = 'toofer_vault';

function generateId(): string {
	return crypto.randomUUID();
}

export function getVaultList(): VaultInfo[] {
	if (typeof localStorage === 'undefined') return [];
	const stored = localStorage.getItem(VAULTS_INDEX_KEY);
	if (!stored) return [];
	try {
		return JSON.parse(stored);
	} catch {
		return [];
	}
}

function saveVaultList(vaults: VaultInfo[]): void {
	localStorage.setItem(VAULTS_INDEX_KEY, JSON.stringify(vaults));
}

export function hasVault(): boolean {
	if (typeof localStorage === 'undefined') return false;
	// Check for new multi-vault system
	const vaults = getVaultList();
	if (vaults.length > 0) return true;
	// Check for legacy single vault
	return localStorage.getItem(LEGACY_STORAGE_KEY) !== null;
}

export function hasLegacyVault(): boolean {
	if (typeof localStorage === 'undefined') return false;
	return localStorage.getItem(LEGACY_STORAGE_KEY) !== null && getVaultList().length === 0;
}

export async function migrateLegacyVault(passphrase: string): Promise<string> {
	const stored = localStorage.getItem(LEGACY_STORAGE_KEY);
	if (!stored) {
		throw new Error('No legacy vault found');
	}

	const vault: EncryptedVault = JSON.parse(stored);
	const decrypted = await decrypt(vault, passphrase);
	const accounts: Account[] = JSON.parse(decrypted);

	// Create new vault with migrated data
	const vaultId = await createVault('My Vault', accounts, passphrase);

	// Remove legacy vault
	localStorage.removeItem(LEGACY_STORAGE_KEY);

	return vaultId;
}

export async function createVault(name: string, accounts: Account[], passphrase: string): Promise<string> {
	const id = generateId();
	const vaultInfo: VaultInfo = {
		id,
		name,
		createdAt: Date.now()
	};

	// Save vault data
	const data = JSON.stringify(accounts);
	const encrypted = await encrypt(data, passphrase);
	localStorage.setItem(VAULT_PREFIX + id, JSON.stringify(encrypted));

	// Update vault index
	const vaults = getVaultList();
	vaults.push(vaultInfo);
	saveVaultList(vaults);

	return id;
}

export async function saveVault(vaultId: string, accounts: Account[], passphrase: string): Promise<void> {
	const data = JSON.stringify(accounts);
	const vault = await encrypt(data, passphrase);
	localStorage.setItem(VAULT_PREFIX + vaultId, JSON.stringify(vault));
}

export async function loadVault(vaultId: string, passphrase: string): Promise<Account[]> {
	const stored = localStorage.getItem(VAULT_PREFIX + vaultId);
	if (!stored) {
		throw new Error('Vault not found');
	}

	const vault: EncryptedVault = JSON.parse(stored);
	const decrypted = await decrypt(vault, passphrase);
	return JSON.parse(decrypted);
}

export function deleteVault(vaultId: string): void {
	// Remove vault data
	localStorage.removeItem(VAULT_PREFIX + vaultId);

	// Update vault index
	const vaults = getVaultList();
	const updated = vaults.filter((v) => v.id !== vaultId);
	saveVaultList(updated);
}

export function renameVault(vaultId: string, newName: string): void {
	const vaults = getVaultList();
	const vault = vaults.find((v) => v.id === vaultId);
	if (vault) {
		vault.name = newName;
		saveVaultList(vaults);
	}
}

export function getVaultInfo(vaultId: string): VaultInfo | undefined {
	const vaults = getVaultList();
	return vaults.find((v) => v.id === vaultId);
}

export function clearVault(): void {
	// Legacy function - clears everything
	localStorage.removeItem(LEGACY_STORAGE_KEY);
	const vaults = getVaultList();
	for (const vault of vaults) {
		localStorage.removeItem(VAULT_PREFIX + vault.id);
	}
	localStorage.removeItem(VAULTS_INDEX_KEY);
}
