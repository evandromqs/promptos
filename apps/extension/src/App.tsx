import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, ChevronRight, Copy, Download, FileText, Heart, ImagePlus, LayoutGrid, Layers3, List, Moon, Plus, Search, Settings2, Sun, Trash2, Upload, Workflow as WorkflowIcon, X } from 'lucide-react';
import { fillTemplate, FREE_LIMIT, localizeStarterPrompt, parseBackup, variablesOf, type Backup, type Locale, type Prompt, type Settings, type Workflow } from '@promptos/core';
import { insertIntoChatGPT } from './chatgpt';
import { t } from './i18n';
import { readThumbnail } from './thumbnail';
import { loadPrompts, loadSettings, loadWorkflows, savePrompts, saveSettings, saveWorkflows } from './storage';

type Section = 'prompts' | 'flows';
type View = 'home' | 'promptEditor' | 'promptUse' | 'flowEditor' | 'flowUse' | 'settings';
const blankPrompt = { title: '', category: '', content: '', thumbnail: '' };
type PendingAction = { type: 'prompt'; id: string } | { type: 'flow'; id: string } | { type: 'import'; backup: Backup };

function ThumbnailPicker({ image, label, addLabel, removeLabel, onFile, onRemove }: {
  image: string; label: string; addLabel: string; removeLabel: string;
  onFile: (event: ChangeEvent<HTMLInputElement>) => void; onRemove: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  return <div className="thumbnail-picker"><div className="field-label">{label}</div><div className="thumbnail-controls">{image && <img src={image} alt={label} />}<button type="button" className="secondary" onClick={() => input.current?.click()}><ImagePlus size={15} />{addLabel}</button>{image && <button type="button" className="thumbnail-remove" onClick={onRemove}>{removeLabel}</button>}</div><input ref={input} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={onFile} /></div>;
}

export function App() {
  const embedded = new URLSearchParams(window.location.search).has('embedded');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [settings, setSettings] = useState<Settings>({ locale: 'pt', theme: 'light' });
  const [ready, setReady] = useState(false);
  const [section, setSection] = useState<Section>('prompts');
  const [view, setView] = useState<View>('home');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [promptForm, setPromptForm] = useState(blankPrompt);
  const [flowTitle, setFlowTitle] = useState('');
  const [flowThumbnail, setFlowThumbnail] = useState('');
  const [flowSteps, setFlowSteps] = useState<string[]>([]);
  const [stepChoice, setStepChoice] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const contentInput = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const tx = t(settings.locale);

  useEffect(() => {
    Promise.all([loadPrompts(), loadWorkflows(), loadSettings()]).then(([p, w, s]) => {
      setPrompts(p); setWorkflows(w); setSettings(s); setReady(true);
    });
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
    document.documentElement.lang = settings.locale;
  }, [settings]);

  useEffect(() => {
    if (!pendingAction) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setPendingAction(null); };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [pendingAction]);

  const displayPrompts = useMemo(() => prompts.map(p => localizeStarterPrompt(p, settings.locale)), [prompts, settings.locale]);
  const categories = useMemo(() => [...new Set(displayPrompts.map(p => p.category).filter(Boolean))].sort(), [displayPrompts]);
  const needle = search.trim().toLocaleLowerCase();
  const visiblePrompts = useMemo(() => displayPrompts.filter(p =>
    (category === 'all' || (category === 'favorites' ? p.favorite : p.category === category)) &&
    (!needle || `${p.title} ${p.category} ${p.content}`.toLocaleLowerCase().includes(needle))
  ).sort((a, b) => Number(b.favorite) - Number(a.favorite) || b.updatedAt - a.updatedAt), [displayPrompts, category, needle]);
  const visibleFlows = useMemo(() => workflows.filter(w => !needle || w.title.toLocaleLowerCase().includes(needle)).sort((a, b) => b.updatedAt - a.updatedAt), [workflows, needle]);
  const activeFlow = workflows.find(w => w.id === activeId);
  const currentPrompt = view === 'flowUse' ? displayPrompts.find(p => p.id === activeFlow?.steps[stepIndex]) : displayPrompts.find(p => p.id === activeId);
  const currentVariables = currentPrompt ? variablesOf(currentPrompt.content) : [];

  function clearMessages() { setNotice(''); setError(''); setMissingFields([]); }
  async function updatePrompts(next: Prompt[]) { setPrompts(next); await savePrompts(next); }
  async function updateWorkflows(next: Workflow[]) { setWorkflows(next); await saveWorkflows(next); }
  async function updateSettings(next: Settings) { setSettings(next); await saveSettings(next); }
  function goHome(nextSection = section) { clearMessages(); setSection(nextSection); setView('home'); }

  function openPromptEditor(prompt?: Prompt) {
    clearMessages(); setEditingId(prompt?.id ?? null);
    setPromptForm(prompt ? { title: prompt.title, category: prompt.category, content: prompt.content, thumbnail: prompt.thumbnail || '' } : blankPrompt);
    setView('promptEditor');
  }

  function insertVariable(name?: string) {
    const input = contentInput.current;
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const selected = input.value.slice(start, end).trim();
    const variable = (name || selected).replace(/[{}\n]/g, '').trim();
    if (!variable) return;
    const token = `{${variable}}`;
    const next = input.value.slice(0, start) + token + input.value.slice(end);
    setPromptForm(form => ({ ...form, content: next }));
    setSelection({ start: start + token.length, end: start + token.length });
    requestAnimationFrame(() => { input.focus(); input.setSelectionRange(start + token.length, start + token.length); });
  }

  async function submitPrompt() {
    if (!promptForm.title.trim() || !promptForm.content.trim()) { setError(tx.nameRequired); return; }
    if (!editingId && prompts.length >= FREE_LIMIT) { setError(tx.limit); return; }
    const previous = prompts.find(p => p.id === editingId);
    const now = Date.now();
    const prompt: Prompt = {
      id: previous?.id ?? crypto.randomUUID(), title: promptForm.title.trim(),
      category: promptForm.category.trim() || tx.custom, content: promptForm.content.trim(),
      favorite: previous?.favorite ?? false, createdAt: previous?.createdAt ?? now, updatedAt: now,
      thumbnail: promptForm.thumbnail || undefined, chatUses: previous?.chatUses ?? 0
    };
    await updatePrompts(previous ? prompts.map(p => p.id === previous.id ? prompt : p) : [prompt, ...prompts]);
    setSearch(''); setCategory('all'); goHome('prompts');
  }

  async function toggleFavorite(prompt: Prompt) {
    await updatePrompts(prompts.map(p => p.id === prompt.id ? { ...p, favorite: !p.favorite, updatedAt: Date.now() } : p));
  }

  function removePrompt(prompt: Prompt) { setPendingAction({ type: 'prompt', id: prompt.id }); }

  function openPromptUse(prompt: Prompt) {
    clearMessages(); setActiveId(prompt.id); setValues({}); setView('promptUse');
  }

  function openFlowEditor(flow?: Workflow) {
    clearMessages(); setEditingId(flow?.id ?? null); setFlowTitle(flow?.title ?? ''); setFlowThumbnail(flow?.thumbnail ?? '');
    setFlowSteps(flow?.steps ?? []); setStepChoice(prompts[0]?.id ?? ''); setView('flowEditor');
  }

  async function submitFlow() {
    if (!flowTitle.trim() || !flowSteps.length) { setError(tx.flowRequired); return; }
    const previous = workflows.find(w => w.id === editingId);
    const now = Date.now();
    const flow: Workflow = { id: previous?.id ?? crypto.randomUUID(), title: flowTitle.trim(), steps: flowSteps, createdAt: previous?.createdAt ?? now, updatedAt: now, thumbnail: flowThumbnail || undefined, chatUses: previous?.chatUses ?? 0 };
    await updateWorkflows(previous ? workflows.map(w => w.id === previous.id ? flow : w) : [flow, ...workflows]);
    setSearch(''); goHome('flows');
  }

  function removeFlow(flow: Workflow) { setPendingAction({ type: 'flow', id: flow.id }); }

  async function confirmAction() {
    const action = pendingAction;
    if (!action) return;
    setPendingAction(null);
    if (action.type === 'prompt') {
      await updatePrompts(prompts.filter(p => p.id !== action.id));
      await updateWorkflows(workflows.map(w => ({ ...w, steps: w.steps.filter(id => id !== action.id) })).filter(w => w.steps.length));
      goHome('prompts');
    } else if (action.type === 'flow') {
      await updateWorkflows(workflows.filter(w => w.id !== action.id));
      goHome('flows');
    } else {
      await savePrompts(action.backup.prompts); await saveWorkflows(action.backup.workflows);
      setPrompts(action.backup.prompts); setWorkflows(action.backup.workflows);
      setNotice(tx.importSuccess); setError('');
    }
  }

  async function chooseThumbnail(event: ChangeEvent<HTMLInputElement>, target: 'prompt' | 'flow') {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file) return;
    try {
      const image = await readThumbnail(file);
      if (target === 'prompt') setPromptForm(form => ({ ...form, thumbnail: image }));
      else setFlowThumbnail(image);
      setError('');
    } catch { setError(tx.imageError); }
  }

  function moveStep(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= flowSteps.length) return;
    const next = [...flowSteps];
    [next[index], next[target]] = [next[target], next[index]];
    setFlowSteps(next);
  }

  function openFlowUse(flow: Workflow) {
    clearMessages(); setActiveId(flow.id); setStepIndex(0); setValues({}); setView('flowUse');
  }

  function changeStep(next: number) { clearMessages(); setStepIndex(next); setValues({}); }

  function preparedText(): string | null {
    if (!currentPrompt) return null;
    const missing = currentVariables.filter(name => !values[name]?.trim());
    if (missing.length) {
      setMissingFields(missing);
      setError(`${tx.missingFields} ${missing.join(', ')}`);
      requestAnimationFrame(() => document.querySelector<HTMLInputElement>('.variables-list input[aria-invalid="true"]')?.focus());
      return null;
    }
    return fillTemplate(currentPrompt.content, values);
  }

  function updateVariable(name: string, value: string) {
    const next = { ...values, [name]: value };
    const remaining = currentVariables.filter(field => !next[field]?.trim());
    setValues(next);
    setMissingFields(missingFields.length ? remaining : []);
    setError(missingFields.length && remaining.length ? `${tx.missingFields} ${remaining.join(', ')}` : '');
    setNotice('');
  }

  async function copyCurrent() {
    const text = preparedText(); if (!text) return;
    try { await navigator.clipboard.writeText(text); setNotice(tx.copied); setError(''); }
    catch { setError(tx.copyFailed); }
  }

  async function insertCurrent() {
    const text = preparedText(); if (!text) return;
    const result = await insertIntoChatGPT(text);
    if (result === 'inserted') {
      setNotice(tx.inserted); setError('');
      if (currentPrompt) await updatePrompts(prompts.map(p => p.id === currentPrompt.id ? { ...p, chatUses: (p.chatUses ?? 0) + 1 } : p));
      if (view === 'flowUse' && activeFlow) await updateWorkflows(workflows.map(w => w.id === activeFlow.id ? { ...w, chatUses: (w.chatUses ?? 0) + 1 } : w));
    }
    else setError(result === 'wrong-tab' ? tx.wrongTab : result === 'unavailable' ? tx.unavailable : result === 'composer-missing' ? tx.composerMissing : tx.insertFailed);
  }

  function exportBackup() {
    const backup: Backup = { format: 'promptos-backup', version: 1, prompts, workflows };
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'promptos-backup.json'; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file) return;
    try {
      const backup = parseBackup(JSON.parse(await file.text()));
      setPendingAction({ type: 'import', backup });
    } catch { setError(tx.importError); setNotice(''); }
  }

  if (!ready) return <div className="loading">PromptOS</div>;

  return <div className="shell">
    {pendingAction && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setPendingAction(null); }}><div className="modal" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-body"><button className="modal-close" aria-label={tx.close} onClick={() => setPendingAction(null)}><X size={16} /></button><div className="modal-icon"><Trash2 size={18} /></div><h2 id="confirm-title">{pendingAction.type === 'prompt' ? tx.deletePromptTitle : pendingAction.type === 'flow' ? tx.deleteFlowTitle : tx.importTitle}</h2><p id="confirm-body">{pendingAction.type === 'prompt' ? tx.deletePromptBody : pendingAction.type === 'flow' ? tx.deleteFlowBody : tx.importConfirm}</p><div className="modal-actions"><button className="secondary" autoFocus onClick={() => setPendingAction(null)}>{tx.cancel}</button><button className="primary" onClick={confirmAction}>{pendingAction.type === 'import' ? tx.import : tx.remove}</button></div></div></div>}
    <header className="topbar">
      <div className="brand"><span className="brand-mark"><Layers3 size={17} strokeWidth={2.5} /></span><span>Prompt<span className="brand-os">OS</span></span></div>
      <div className="topbar-actions"><button className="icon-button" aria-label={tx.settings} title={tx.settings} onClick={() => { clearMessages(); setView(view === 'settings' ? 'home' : 'settings'); }}><Settings2 size={17} /></button>{embedded && <button className="icon-button" aria-label={tx.close} title={tx.close} onClick={() => window.parent.postMessage({ type: 'promptos:collapse' }, '*')}><X size={17} /></button>}</div>
    </header>

    {view === 'home' && <>
      <main className="home-content">
        <div className="intro"><div><span className="overline">PROMPTOS</span><h1>{section === 'prompts' ? tx.library : tx.workflows}</h1></div><span className="intro-symbol">{section === 'prompts' ? <FileText size={19} /> : <WorkflowIcon size={19} />}</span></div>
        <div className="home-actions"><button className="primary new-button" onClick={() => section === 'prompts' ? openPromptEditor() : openFlowEditor()}><Plus size={16} />{section === 'prompts' ? tx.newPrompt : tx.newWorkflow}</button><div className="credits" aria-label={tx.credits}><strong>{Math.max(0, FREE_LIMIT - prompts.length)}</strong><small>{tx.credits}</small></div></div>
        <div className="section-tabs" role="tablist" aria-label={tx.library}>
          <button role="tab" aria-selected={section === 'prompts'} className={section === 'prompts' ? 'selected' : ''} onClick={() => { setSection('prompts'); setSearch(''); }}>{tx.library}</button>
          <button role="tab" aria-selected={section === 'flows'} className={section === 'flows' ? 'selected' : ''} onClick={() => { setSection('flows'); setSearch(''); }}>{tx.workflows}</button>
        </div>
        <div className="search-wrap"><Search size={16} /><input aria-label={section === 'prompts' ? tx.search : tx.searchFlows} placeholder={section === 'prompts' ? tx.search : tx.searchFlows} value={search} onChange={e => setSearch(e.target.value)} />{search && <button className="clear" aria-label={tx.close} onClick={() => setSearch('')}><X size={14} /></button>}</div>
        {section === 'prompts' && <div className="category-strip" aria-label={tx.category}>
          <button className={category === 'all' ? 'chip active' : 'chip'} onClick={() => setCategory('all')}>{tx.all}</button>
          <button className={category === 'favorites' ? 'chip active' : 'chip'} onClick={() => setCategory('favorites')}><Heart size={12} />{tx.favorites}</button>
          {categories.map(c => <button key={c} className={category === c ? 'chip active' : 'chip'} onClick={() => setCategory(c)}>{c}</button>)}
        </div>}
        <div className="section-heading"><h2>{section === 'prompts' ? tx.yourPrompts : tx.yourFlows}</h2><span className="count-pill">{section === 'prompts' ? visiblePrompts.length : visibleFlows.length}</span><div className="view-toggle" role="group" aria-label={tx.listView}><button className={settings.viewMode !== 'cards' ? 'selected' : ''} aria-label={tx.listView} title={tx.listView} onClick={() => updateSettings({ ...settings, viewMode: 'list' })}><List size={15} /></button><button className={settings.viewMode === 'cards' ? 'selected' : ''} aria-label={tx.cardView} title={tx.cardView} onClick={() => updateSettings({ ...settings, viewMode: 'cards' })}><LayoutGrid size={15} /></button></div></div>
        <div className={settings.viewMode === 'cards' ? 'list card-grid' : 'list'}>
          {section === 'prompts' ? visiblePrompts.map(prompt => <article className="item-card" key={prompt.id}>
            <button className="item-main" onClick={() => openPromptUse(prompt)} aria-label={`${tx.use}: ${prompt.title}`}><span className="item-icon">{prompt.thumbnail ? <img src={prompt.thumbnail} alt="" /> : <FileText size={17} />}</span><span className="item-copy"><strong>{prompt.title}</strong><small>{prompt.category} · {variablesOf(prompt.content).length} {tx.variables}</small><small>{prompt.chatUses ?? 0} {tx.chatUses}</small></span><ChevronRight size={16} className="item-arrow" /></button>
            <button className={`favorite-button ${prompt.favorite ? 'is-favorite' : ''}`} title={tx.favorites} aria-label={tx.favorites} onClick={() => toggleFavorite(prompt)}><Heart size={16} fill={prompt.favorite ? 'currentColor' : 'none'} /></button>
          </article>) : visibleFlows.map(flow => <article className="item-card" key={flow.id}><button className="item-main" onClick={() => openFlowUse(flow)} aria-label={`${tx.use}: ${flow.title}`}><span className="item-icon">{flow.thumbnail ? <img src={flow.thumbnail} alt="" /> : <WorkflowIcon size={17} />}</span><span className="item-copy"><strong>{flow.title}</strong><small>{flow.steps.length} {tx.steps.toLowerCase()}</small><small>{flow.chatUses ?? 0} {tx.chatUses}</small></span><ChevronRight size={16} className="item-arrow" /></button></article>)}
          {(section === 'prompts' ? !visiblePrompts.length : !visibleFlows.length) && <div className="empty"><span className="empty-icon">{section === 'prompts' ? <FileText size={22} /> : <WorkflowIcon size={22} />}</span><strong>{section === 'prompts' ? tx.emptyPrompts : tx.emptyFlows}</strong><small>{tx.emptyHint}</small></div>}
        </div>
      </main>
    </>}

    {view === 'promptEditor' && <main className="page-content"><button className="back" onClick={() => goHome('prompts')}><ArrowLeft size={16} />{tx.back}</button><div className="page-head"><span className="overline">{tx.promptEditor}</span><h1>{editingId ? tx.edit : tx.newPrompt}</h1></div><div className="form-card"><label>{tx.title}<input autoFocus value={promptForm.title} placeholder={tx.titlePlaceholder} onChange={e => setPromptForm({ ...promptForm, title: e.target.value })} /></label><label>{tx.category}<input value={promptForm.category} placeholder={tx.categoryPlaceholder} onChange={e => setPromptForm({ ...promptForm, category: e.target.value })} /></label><label>{tx.content}<textarea ref={contentInput} rows={7} value={promptForm.content} placeholder={tx.contentPlaceholder} onSelect={e => setSelection({ start: e.currentTarget.selectionStart, end: e.currentTarget.selectionEnd })} onChange={e => setPromptForm({ ...promptForm, content: e.target.value })} /></label><div className="field-label">{tx.variableTools}</div><p className="editor-hint">{tx.selectTextHint}</p><div className="var-tags"><button type="button" className="tag-create" disabled={selection.start === selection.end} onMouseDown={e => e.preventDefault()} onClick={() => insertVariable()}><Plus size={13} />{tx.wrapSelection}</button>{variablesOf(promptForm.content).map(v => <button type="button" key={v} onMouseDown={e => e.preventDefault()} onClick={() => insertVariable(v)}>{`{${v}}`}</button>)}</div><ThumbnailPicker image={promptForm.thumbnail} label={tx.thumbnail} addLabel={tx.addThumbnail} removeLabel={tx.removeThumbnail} onFile={e => chooseThumbnail(e, 'prompt')} onRemove={() => setPromptForm(form => ({ ...form, thumbnail: '' }))} /></div>{error && <p className="message error">{error}</p>}<div className="page-actions"><button className="secondary" onClick={() => goHome('prompts')}>{tx.cancel}</button><button className="primary" onClick={submitPrompt}><Check size={16} />{tx.save}</button></div></main>}

    {view === 'flowEditor' && <main className="page-content"><button className="back" onClick={() => goHome('flows')}><ArrowLeft size={16} />{tx.back}</button><div className="page-head"><span className="overline">{tx.flowEditor}</span><h1>{editingId ? tx.edit : tx.newWorkflow}</h1></div><div className="form-card"><label>{tx.title}<input autoFocus value={flowTitle} onChange={e => setFlowTitle(e.target.value)} /></label><div className="field-label">{tx.steps}</div><div className="steps-list">{flowSteps.map((id, index) => <div className="step-row" key={`${id}-${index}`}><span className="step-number">{index + 1}</span><strong>{prompts.find(p => p.id === id)?.title || tx.missingPrompt}</strong><button aria-label={tx.moveUp} disabled={index === 0} onClick={() => moveStep(index, -1)}><ArrowUp size={15} /></button><button aria-label={tx.moveDown} disabled={index === flowSteps.length - 1} onClick={() => moveStep(index, 1)}><ArrowDown size={15} /></button><button aria-label={tx.removeStep} onClick={() => setFlowSteps(flowSteps.filter((_, i) => i !== index))}><X size={15} /></button></div>)}</div>{prompts.length ? <div className="add-step"><select aria-label={tx.choosePrompt} value={stepChoice} onChange={e => setStepChoice(e.target.value)}>{prompts.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}</select><button className="secondary" onClick={() => stepChoice && setFlowSteps([...flowSteps, stepChoice])}><Plus size={16} />{tx.addStep}</button></div> : <p className="muted">{tx.noPromptsForFlow}</p>}<ThumbnailPicker image={flowThumbnail} label={tx.thumbnail} addLabel={tx.addThumbnail} removeLabel={tx.removeThumbnail} onFile={e => chooseThumbnail(e, 'flow')} onRemove={() => setFlowThumbnail('')} /></div>{error && <p className="message error">{error}</p>}<div className="page-actions"><button className="secondary" onClick={() => goHome('flows')}>{tx.cancel}</button><button className="primary" onClick={submitFlow}><Check size={16} />{tx.save}</button></div></main>}

    {(view === 'promptUse' || view === 'flowUse') && currentPrompt && <main className="page-content"><button className="back" onClick={() => goHome(view === 'flowUse' ? 'flows' : 'prompts')}><ArrowLeft size={16} />{tx.back}</button><div className="page-head"><span className="overline">{view === 'flowUse' ? `${activeFlow?.title} · ${tx.step} ${stepIndex + 1}/${activeFlow?.steps.length}` : currentPrompt.category}</span><h1>{currentPrompt.title}</h1></div>{(view === 'flowUse' ? (activeFlow?.thumbnail || currentPrompt.thumbnail) : currentPrompt.thumbnail) && <img className="reference-image" src={view === 'flowUse' ? (activeFlow?.thumbnail || currentPrompt.thumbnail) : currentPrompt.thumbnail} alt={tx.thumbnail} />}<div className="form-card">{currentVariables.length ? <div className="variables-list"><div className="field-label">{tx.fillFields}</div>{currentVariables.map(name => <label key={name}><span className="variable-label">{name}{missingFields.includes(name) && <small>{tx.required}</small>}</span><input aria-invalid={missingFields.includes(name)} value={values[name] || ''} onChange={e => updateVariable(name, e.target.value)} placeholder={name} /></label>)}</div> : <p className="muted">{tx.noVariables}</p>}<div className="field-label preview-label">{tx.preview}</div><div className="preview">{fillTemplate(currentPrompt.content, values)}</div></div>{error && <p className="message error" role="alert">{error}</p>}{notice && <p className="message success">{notice}</p>}<div className="use-actions"><button className="primary" onClick={copyCurrent}><Copy size={16} />{tx.copy}</button><button className="secondary" onClick={insertCurrent}><ArrowRight size={16} />{tx.insert}</button></div>{view === 'flowUse' && activeFlow && <div className="flow-navigation"><button className="secondary" disabled={stepIndex === 0} onClick={() => changeStep(stepIndex - 1)}><ArrowLeft size={15} />{tx.previous}</button>{stepIndex < activeFlow.steps.length - 1 ? <button className="secondary" onClick={() => changeStep(stepIndex + 1)}>{tx.next}<ArrowRight size={15} /></button> : <button className="secondary" onClick={() => goHome('flows')}><Check size={15} />{tx.finish}</button>}</div>}<div className="sub-actions"><button onClick={() => view === 'flowUse' && activeFlow ? openFlowEditor(activeFlow) : openPromptEditor(currentPrompt)}>{tx.edit}</button><button className="danger" onClick={() => view === 'flowUse' && activeFlow ? removeFlow(activeFlow) : removePrompt(currentPrompt)}><Trash2 size={14} />{tx.remove}</button></div></main>}

    {view === 'settings' && <main className="page-content"><button className="back" onClick={() => goHome()}><ArrowLeft size={16} />{tx.back}</button><div className="page-head"><span className="overline">PROMPTOS</span><h1>{tx.settings}</h1></div><div className="form-card settings-card"><label>{tx.language}<select value={settings.locale} onChange={e => updateSettings({ ...settings, locale: e.target.value as Locale })}><option value="pt">Português</option><option value="en">English</option><option value="es">Español</option></select></label><div className="field-label">{tx.theme}</div><div className="theme-options"><button className={settings.theme === 'light' ? 'selected' : ''} onClick={() => updateSettings({ ...settings, theme: 'light' })}><Sun size={16} />{tx.light}</button><button className={settings.theme === 'dark' ? 'selected' : ''} onClick={() => updateSettings({ ...settings, theme: 'dark' })}><Moon size={16} />{tx.dark}</button></div><div className="settings-divider" /><button className="utility-button" onClick={exportBackup}><Download size={16} />{tx.export}</button><button className="utility-button" onClick={() => fileInput.current?.click()}><Upload size={16} />{tx.import}</button><input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={importBackup} /></div>{error && <p className="message error">{error}</p>}{notice && <p className="message success">{notice}</p>}<p className="settings-note">{tx.localOnly}</p></main>}
  </div>;
}
