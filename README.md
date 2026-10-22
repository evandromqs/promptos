# PromptOS

> **Seus prompts organizados. Seus fluxos prontos para usar.**

Extensão para Google Chrome (Manifest V3) que permite organizar, preencher templates dinâmicos e reutilizar prompts diretamente no ChatGPT com um único clique.

🌐 **Website oficial & GitHub Pages:** [https://evandromarquespf.github.io/promptos/](https://evandromarquespf.github.io/promptos/)  
🔒 **Política de Privacidade:** [https://evandromarquespf.github.io/promptos/privacy.html](https://evandromarquespf.github.io/promptos/privacy.html)  
📄 **Termos de Uso:** [https://evandromarquespf.github.io/promptos/terms.html](https://evandromarquespf.github.io/promptos/terms.html)  

---

## Estrutura do Monorepo

- `apps/extension`: Interface da extensão em React 19, TypeScript e Vite; extensão Manifest V3 com painel lateral flutuante e injeção no ChatGPT.
- `packages/core`: Modelos de dados, validação de backups, localização e lógica de templates.
- `docs/`: Página inicial, política de privacidade, termos de uso e assets para o GitHub Pages.
- `store-assets/`: Pacote ZIP (`promptos-v0.5.0-webstore.zip`), ícone 128x128 e capturas de tela (1280x800) formatados para a Chrome Web Store.

---

## Funcionalidades

- **Biblioteca Inteligente:** Criação, edição, exclusão, busca instantânea, categorias e favoritos.
- **Templates Dinâmicos:** Variáveis `{nome}` preenchíveis com cópia ou inserção direta.
- **Workflows Sequenciais:** Encadeamento de múltiplos prompts em etapas ordenáveis.
- **Inserção Direta no ChatGPT:** Transfere o texto para a caixa de mensagem sob demanda (sem disparo automático).
- **100% Local e Privado:** Todos os dados ficam salvos no `chrome.storage.local`. Sem cadastro, sem telemetria e sem servidores remotos.
- **Backup JSON:** Exportação e restauração completa da biblioteca.
- **Temas:** Suporte aos temas Claro e Escuro, além de suporte a Português, Inglês e Espanhol.

---

## Como Instalar e Testar Localmente

1. Clone o repositório e instale as dependências:
   ```sh
   git clone https://github.com/EvandroMarquesPF/promptos.git
   cd promptos
   npm install
   npm run build
   ```

2. No Google Chrome, abra `chrome://extensions`.
3. Ative o **Modo do desenvolvedor** no canto superior direito.
4. Clique em **Carregar sem compactação** e selecione a pasta `apps/extension/dist`.
5. Abra o [ChatGPT](https://chatgpt.com) e clique no ícone da extensão ou no botão flutuante para abrir o painel.
