# Política de Privacidade — PromptOS

**Última atualização:** 22 de outubro de 2026

O **PromptOS** foi desenvolvido com um compromisso fundamental: **sua privacidade em primeiro lugar**. Acreditamos que seus prompts, ideias e fluxos de trabalho pertencem exclusivamente a você.

---

### 1. Coleta e Armazenamento de Dados
- **Armazenamento 100% Local:** Todos os prompts, categorias, favoritos, fluxos de trabalho (workflows) e configurações são gravados exclusivamente no armazenamento local do seu navegador através da API `chrome.storage.local`.
- **Sem Servidores Externos:** O PromptOS não opera servidores remotos de banco de dados, telemetria ou rastreamento.
- **Sem Coleta de Informações Pessoais:** A extensão não solicita, não registra e não transmite nome, e-mail, senhas, histórico de navegação ou dados bancários.

---

### 2. Uso das Permissões do Chrome (Manifest V3)
O PromptOS solicita apenas as permissões estritamente indispensáveis para o seu funcionamento:

- **`storage`**: Utilizada para salvar seus prompts, preferências visuais (tema claro/escuro) e fluxos no armazenamento interno do navegador em sua máquina.
- **`scripting` e Host Permissions (`https://chatgpt.com/*`, `https://chat.openai.com/*`)**:
  - Utilizadas para exibir o painel lateral retrátil integrado e transferir o texto do prompt selecionado para a caixa de mensagem do ChatGPT quando você clica em *"Inserir no ChatGPT"*.
  - A extensão **não lê** seu histórico de conversas nem envia mensagens automaticamente — o envio só ocorre quando você clica manualmente no botão de enviar do chat.

---

### 3. Compartilhamento com Terceiros
Nenhum dado pessoal ou de uso é vendido, transferido ou compartilhado com terceiros ou redes de publicidade.

---

### 4. Backup e Exportação
O usuário possui controle total para exportar todos os seus dados em formato JSON a qualquer momento através da aba de configurações, bem como restaurá-los quando desejar.

---

### 5. Contato e Dúvidas
Se tiver dúvidas ou sugestões sobre esta política, entre em contato através do repositório oficial ou canal de suporte.
