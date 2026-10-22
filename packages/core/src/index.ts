export type Locale = 'pt' | 'en' | 'es';
export type Theme = 'light' | 'dark';

export interface Prompt {
  id: string;
  title: string;
  category: string;
  content: string;
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
  chatUses?: number;
}

export interface Settings {
  locale: Locale;
  theme: Theme;
  viewMode?: 'list' | 'cards';
}

export interface Workflow {
  id: string;
  title: string;
  steps: string[];
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
  chatUses?: number;
}

export interface Backup {
  format: 'promptos-backup';
  version: 1;
  prompts: Prompt[];
  workflows: Workflow[];
}

export const FREE_LIMIT = 20;

export const starterPrompts: Prompt[] = [
  { id: 'starter-1', title: 'Descrição de produto', category: 'Marketing', content: 'Crie uma descrição clara e persuasiva para {produto}, destinada a {público}, com tom {tom}. Destaque os principais benefícios e termine com uma chamada para ação.', favorite: true, createdAt: 1, updatedAt: 1 },
  { id: 'starter-2', title: 'Revisar código', category: 'Programação', content: 'Revise o código abaixo em {linguagem}. Identifique bugs, riscos e oportunidades de simplificação. Explique cada sugestão com um exemplo.\n\n{código}', favorite: false, createdAt: 2, updatedAt: 2 },
  { id: 'starter-3', title: 'Resumo de estudo', category: 'Estudos', content: 'Resuma o tema {tema} para uma pessoa com nível {nível}. Organize em conceitos principais, exemplos práticos e três perguntas para revisão.', favorite: false, createdAt: 3, updatedAt: 3 }
];

const starterTranslations: Record<Locale, Record<string, Pick<Prompt, 'title' | 'category' | 'content'>>> = {
  pt: {},
  en: {
    'starter-1': { title: 'Product description', category: 'Marketing', content: 'Write a clear, persuasive description of {product} for {audience} in a {tone} tone. Highlight the main benefits and finish with a call to action.' },
    'starter-2': { title: 'Code review', category: 'Programming', content: 'Review the code below in {language}. Identify bugs, risks, and opportunities to simplify it. Explain each suggestion with an example.\n\n{code}' },
    'starter-3': { title: 'Study summary', category: 'Studies', content: 'Summarize {topic} for someone at {level} level. Organize it into key concepts, practical examples, and three review questions.' }
  },
  es: {
    'starter-1': { title: 'Descripción de producto', category: 'Marketing', content: 'Escribe una descripción clara y persuasiva de {producto} para {público}, con un tono {tono}. Destaca los principales beneficios y termina con una llamada a la acción.' },
    'starter-2': { title: 'Revisión de código', category: 'Programación', content: 'Revisa el siguiente código en {lenguaje}. Identifica errores, riesgos y oportunidades para simplificarlo. Explica cada sugerencia con un ejemplo.\n\n{código}' },
    'starter-3': { title: 'Resumen de estudio', category: 'Estudios', content: 'Resume {tema} para una persona de nivel {nivel}. Organiza el contenido en conceptos clave, ejemplos prácticos y tres preguntas de repaso.' }
  }
};

export function localizeStarterPrompt(prompt: Prompt, locale: Locale): Prompt {
  const original = starterPrompts.find(item => item.id === prompt.id);
  if (!original || locale === 'pt' || prompt.title !== original.title || prompt.category !== original.category || prompt.content !== original.content) return prompt;
  return { ...prompt, ...starterTranslations[locale][prompt.id] };
}

export function variablesOf(content: string): string[] {
  return [...new Set([...content.matchAll(/\{([^{}\n]+)\}/g)].map((match) => match[1].trim()).filter(Boolean))];
}

export function fillTemplate(content: string, values: Record<string, string>): string {
  return content.replace(/\{([^{}\n]+)\}/g, (match, rawName: string) => {
    const name = rawName.trim();
    return values[name]?.trim() || match;
  });
}

export function parseBackup(value: unknown): Backup {
  if (!value || typeof value !== 'object') throw new Error('invalid-backup');
  const data = value as Partial<Backup>;
  if (data.format !== 'promptos-backup' || data.version !== 1 || !Array.isArray(data.prompts) || !Array.isArray(data.workflows)) throw new Error('invalid-backup');
  if (data.prompts.length > FREE_LIMIT) throw new Error('limit');
  const prompts: Prompt[] = data.prompts.map((entry) => {
    if (!entry || typeof entry.id !== 'string' || !entry.id || typeof entry.title !== 'string' || !entry.title.trim() || typeof entry.category !== 'string' || typeof entry.content !== 'string' || !entry.content.trim() || typeof entry.favorite !== 'boolean' || !Number.isFinite(entry.createdAt) || !Number.isFinite(entry.updatedAt)) throw new Error('invalid-backup');
    if (entry.thumbnail !== undefined && (typeof entry.thumbnail !== 'string' || entry.thumbnail.length > 180_000 || !/^data:image\/(png|jpeg|webp);base64,/.test(entry.thumbnail))) throw new Error('invalid-backup');
    if (entry.chatUses !== undefined && (!Number.isSafeInteger(entry.chatUses) || entry.chatUses < 0)) throw new Error('invalid-backup');
    return { id: entry.id, title: entry.title, category: entry.category, content: entry.content, favorite: entry.favorite, createdAt: entry.createdAt, updatedAt: entry.updatedAt, thumbnail: entry.thumbnail, chatUses: entry.chatUses };
  });
  const promptIds = new Set(prompts.map((prompt) => prompt.id));
  if (promptIds.size !== prompts.length) throw new Error('invalid-backup');
  const workflows: Workflow[] = data.workflows.map((entry) => {
    if (!entry || typeof entry.id !== 'string' || !entry.id || typeof entry.title !== 'string' || !entry.title.trim() || !Array.isArray(entry.steps) || !entry.steps.length || !entry.steps.every((step) => typeof step === 'string' && promptIds.has(step)) || !Number.isFinite(entry.createdAt) || !Number.isFinite(entry.updatedAt)) throw new Error('invalid-backup');
    if (entry.thumbnail !== undefined && (typeof entry.thumbnail !== 'string' || entry.thumbnail.length > 180_000 || !/^data:image\/(png|jpeg|webp);base64,/.test(entry.thumbnail))) throw new Error('invalid-backup');
    if (entry.chatUses !== undefined && (!Number.isSafeInteger(entry.chatUses) || entry.chatUses < 0)) throw new Error('invalid-backup');
    return { id: entry.id, title: entry.title, steps: entry.steps, createdAt: entry.createdAt, updatedAt: entry.updatedAt, thumbnail: entry.thumbnail, chatUses: entry.chatUses };
  });
  if (new Set(workflows.map((workflow) => workflow.id)).size !== workflows.length) throw new Error('invalid-backup');
  return { format: 'promptos-backup', version: 1, prompts, workflows };
}
