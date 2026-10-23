# PromptOS — Detalhes da Chrome Web Store (EN / ES / PT-BR)

Guia completo com textos prontos para copiar e colar no **Painel do Desenvolvedor da Chrome Web Store** (*Chrome Web Store Developer Dashboard*), permitindo que o app alcance o público global em **Inglês**, **Espanhol** e **Português**.

---

## 📌 Como adicionar idiomas no Painel da Chrome Web Store

1. Acesse o [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
2. Clique na sua extensão **PromptOS**.
3. No menu lateral esquerdo, vá em **Ficha da loja** (*Store listing*).
4. No topo da página, clique em **Adicionar tradução** (*Add translation*) ou **Gerenciar idiomas** (*Manage languages*).
5. Selecione **English** e **Español** (além de *Português - Brasil*, que já deve ser o padrão).
6. Para cada idioma selecionado, preencha os campos abaixo: **Nome**, **Descrição curta** e **Descrição detalhada**.
7. Salve as alterações e envie para publicação (*Submit for review*).

---

# 🇺🇸 ENGLISH (United States / Global)

### Name (Item name)
`PromptOS`  
*(Opção com subtítulo: `PromptOS - ChatGPT Prompt Manager & Workflows` — 44/45 chars)*

### Short Description / Summary (Max 132 chars)
`Organize prompts, fill dynamic templates, and run sequential workflows directly inside ChatGPT.`  
*(96 caracteres)*

### Detailed Description
```text
Keep your best prompts organized, customizable, and ready to use in ChatGPT with a single click.

PromptOS adds a sleek, productivity-boosting sidebar directly to the ChatGPT interface. Access your personal prompt library, fill in template variables on the fly, and run multi-step workflows without ever leaving your browser tab.

KEY FEATURES:
• Smart Library: Create, edit, and organize prompts with custom categories.
• Instant Search & Favorites: Pin your most-used prompts and search instantly.
• Dynamic Variables: Turn prompts into templates using {variables} with dedicated input fields.
• Sequential Workflows: Chain multiple prompts into guided step-by-step processes.
• 1-Click ChatGPT Insertion: Insert formatted text straight into the message box (no accidental auto-sends).
• Quick Copy: Copy prompt text with filled variables to the clipboard anytime.
• Visual References: Attach preview images/thumbnails to your prompts for context.
• Seamless Backup: Export and import your entire library via clean JSON files.
• Customizable UI: Toggle between Light and Dark modes, and choose between English, Spanish, or Portuguese.

100% PRIVATE & LOCAL:
• Your data stays on your machine: Everything is stored safely in chrome.storage.local.
• No account or login required.
• Zero telemetry, zero tracking, and no external servers.
• Safe insertion: Text is only placed in the input box upon your explicit click; sending messages remains completely under your control.

COMPATIBILITY:
Seamlessly works on both chatgpt.com and chat.openai.com.

DISCLAIMER:
PromptOS is an independent project and is not affiliated with, endorsed, or sponsored by OpenAI.
```

### Privacy: Single Purpose Description (English)
`PromptOS provides an in-page companion panel for ChatGPT that helps users organize, customize, and reuse their personal prompt library. Users can manage prompt categories, fill dynamic template variables, and run multi-step workflows. The prepared text can be copied or directly inserted into the ChatGPT message box upon explicit user action, without automatic submission. All library data and user preferences are stored entirely locally in the browser with JSON import/export support.`

### Permissions Justifications (English)
- **storage:** `Required to locally store the user's prompt library, categories, favorites, reference thumbnails, workflows, usage counters, and interface preferences using chrome.storage.local. No data is sent to external servers.`
- **scripting:** `Required to insert the user's chosen prompt into the active ChatGPT input field upon explicit request, and to inject the companion interface script if not yet loaded. It does not scrape chat history or send messages automatically.`
- **host_permissions (`https://chatgpt.com/*`, `https://chat.openai.com/*`):** `Required to display the PromptOS floating button and sidebar inside ChatGPT and locate the active prompt composer to insert user-selected text.`

---

# 🇪🇸 ESPAÑOL (Latinoamérica / España)

### Name (Nombre del elemento)
`PromptOS`  
*(Opción con subtítulo: `PromptOS - Gestor de Prompts para ChatGPT` — 40/45 chars)*

### Short Description / Resumen (Máx 132 caracteres)
`Organiza prompts, completa plantillas dinámicas y ejecuta flujos de trabajo directamente en ChatGPT.`  
*(100 caracteres)*

### Detailed Description (Descripción detallada)
```text
Mantén tus mejores prompts organizados, personalizables y listos para usar en ChatGPT con un solo clic.

PromptOS añade un panel lateral flotante e intuitivo dentro de la interfaz de ChatGPT. Accede a tu biblioteca personal de prompts, completa variables de plantillas al instante y ejecuta flujos de trabajo paso a paso sin cambiar de pestaña.

CARACTERÍSTICAS PRINCIPALES:
• Biblioteca Inteligente: Crea, edita y organiza tus prompts por categorías personalizadas.
• Búsqueda Rápida y Favoritos: Marca tus prompts esenciales y encuéntralos al instante.
• Plantillas Dinámicas: Usa variables como {tema} o {publico} para generar campos autocompletables.
• Flujos de Trabajo Secuenciales: Encadena múltiples prompts en etapas guiadas y ordenadas.
• Inserción en ChatGPT con 1 Clic: Pega el texto preparado directamente en el cuadro de mensaje (sin envíos accidentales).
• Copia Rápida: Copia el texto con las variables completadas al portapapeles en cualquier momento.
• Miniaturas de Referencia: Agrega imágenes de vista previa a tus prompts para mayor contexto visual.
• Copias de Seguridad: Exporta e importa toda tu biblioteca fácilmente en formato JSON.
• Interfaz Adaptable: Compatible con modo Claro y Oscuro, e idiomas en Español, Inglés y Portugués.

100% PRIVADO Y LOCAL:
• Tus datos se quedan en tu navegador: Todo se guarda de forma segura en chrome.storage.local.
• No requiere registro ni creación de cuenta.
• Sin telemetría, sin rastreo y sin servidores externos.
• Control total: El texto solo se coloca en el cuadro de mensaje cuando tú lo decides; el envío sigue estando bajo tu control.

COMPATIBILIDAD:
Compatible con chatgpt.com y chat.openai.com.

AVISO LEGAL:
PromptOS es una extensión independiente y no está afiliada, respaldada ni patrocinada por OpenAI.
```

### Privacy: Descripción del único propósito (Español)
`PromptOS proporciona un panel lateral integrado en ChatGPT para organizar, personalizar y reutilizar una biblioteca personal de prompts. Permite crear categorías, completar plantillas dinámicas y recorrer flujos secuenciales de trabajo. El texto preparado se puede copiar o insertar en el cuadro de mensaje de ChatGPT mediante acción explícita del usuario, sin envíos automáticos. Todos los datos y preferencias se almacenan localmente en el navegador con soporte de copia de seguridad en JSON.`

---

# 🇧🇷 PORTUGUÊS (Brasil)

### Nome
`PromptOS`  
*(Opção com subtítulo: `PromptOS - Gerenciador de Prompts no ChatGPT` — 42/45 chars)*

### Descrição curta (Máx 132 caracteres)
`Organize prompts, preencha templates e reutilize sequências de trabalho diretamente no ChatGPT.`  
*(94 caracteres)*

### Descrição detalhada
```text
Mantenha seus prompts organizados, personalizáveis e prontos para reutilizar no ChatGPT com um único clique.

O PromptOS adiciona um painel lateral prático e intuitivo à página do ChatGPT para você acessar sua biblioteca, preencher variáveis em tempo real e preparar textos sem alternar entre várias ferramentas.

RECURSOS PRINCIPAIS:
• Biblioteca Inteligente: Crie, edite e organize prompts por categorias personalizadas.
• Busca Instantânea e Favoritos: Encontre seus textos facilmente e acesse seus itens favoritos.
• Templates Dinâmicos: Use variáveis como {tema} e {publico} para preencher campos sob demanda.
• Workflows Sequenciais: Monte sequências de prompts e avance pelas etapas com facilidade.
• Inserção Direta no ChatGPT: Insira o texto na caixa de mensagem com 1 clique (sem envio automático).
• Cópia Rápida: Copie o texto preparado com variáveis preenchidas para a área de transferência.
• Imagens de Referência: Adicione miniaturas visuais aos seus prompts para rápido reconhecimento.
• Backup Completo: Exporte e importe sua biblioteca a qualquer momento em arquivos JSON.
• Temas e Idiomas: Suporte a tema Claro e Escuro, com interface em Português, Inglês e Espanhol.

100% LOCAL E PRIVADO:
• Seus dados não saem do navegador: Armazenamento exclusivo via chrome.storage.local.
• Sem necessidade de login ou cadastro.
• Sem rastreamento, sem telemetria e sem servidores remotos.
• A inserção depende de um clique seu; o envio da mensagem continua sob seu controle no ChatGPT.

COMPATIBILIDADE:
Totalmente compatível com chatgpt.com e chat.openai.com.

AVISO LEGAL:
PromptOS é uma extensão independente, sem afiliação ou endosso da OpenAI.
```
