import type { Prompt, Settings, Workflow } from '@promptos/core';
import { starterPrompts } from '@promptos/core';

const PROMPTS_KEY = 'promptos.prompts.v1';
const SETTINGS_KEY = 'promptos.settings.v1';
const WORKFLOWS_KEY = 'promptos.workflows.v1';

function isExtension(): boolean { return typeof chrome !== 'undefined' && !!chrome.storage?.local; }

async function getValue<T>(key: string): Promise<T | undefined> {
  if (isExtension()) return (await chrome.storage.local.get(key))[key] as T | undefined;
  const raw = localStorage.getItem(key);
  if (!raw) return undefined;
  try { return JSON.parse(raw) as T; } catch { return undefined; }
}

async function setValue<T>(key: string, value: T): Promise<void> {
  if (isExtension()) await chrome.storage.local.set({ [key]: value });
  else localStorage.setItem(key, JSON.stringify(value));
}

export async function loadPrompts(): Promise<Prompt[]> {
  const saved = await getValue<Prompt[]>(PROMPTS_KEY);
  if (Array.isArray(saved)) return saved;
  await setValue(PROMPTS_KEY, starterPrompts);
  return starterPrompts;
}

export function savePrompts(prompts: Prompt[]): Promise<void> { return setValue(PROMPTS_KEY, prompts); }

export async function loadSettings(): Promise<Settings> {
  const saved = await getValue<Settings>(SETTINGS_KEY);
  return { locale: saved?.locale || 'pt', theme: saved?.theme || 'light', viewMode: saved?.viewMode === 'cards' ? 'cards' : 'list' };
}

export function saveSettings(settings: Settings): Promise<void> { return setValue(SETTINGS_KEY, settings); }

export async function loadWorkflows(): Promise<Workflow[]> {
  const saved = await getValue<Workflow[]>(WORKFLOWS_KEY);
  return Array.isArray(saved) ? saved : [];
}

export function saveWorkflows(workflows: Workflow[]): Promise<void> { return setValue(WORKFLOWS_KEY, workflows); }
