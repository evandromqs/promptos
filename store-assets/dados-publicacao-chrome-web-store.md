# PromptOS — dados para publicação na Chrome Web Store

Preparado em 22/10/2026 com base no código-fonte da versão 0.5.0. Este documento contém textos para copiar no painel; não representa preenchimento ou envio do formulário online. As declarações devem corresponder ao ZIP efetivamente enviado.

## Privacidade

### Descrição do único propósito

O PromptOS permite organizar e reutilizar uma biblioteca pessoal de prompts no ChatGPT. Em um painel integrado à página, o usuário cria e edita prompts, organiza categorias e favoritos, preenche variáveis em templates e percorre sequências de prompts em etapas. O texto preparado pode ser copiado ou inserido na caixa de mensagem do ChatGPT por ação explícita do usuário, sem envio automático. A biblioteca e as preferências são armazenadas localmente no navegador, com exportação e importação de backup em JSON.

### Justificativa da permissão storage

A permissão storage é necessária para armazenar localmente a biblioteca de prompts, categorias, favoritos, imagens de referência, sequências de prompts, contadores locais de uso e preferências de idioma, tema e visualização. Os dados são gravados em chrome.storage.local para que permaneçam disponíveis entre sessões. A extensão não sincroniza esses dados com servidores do desenvolvedor nem utiliza esse armazenamento para rastreamento.

### Justificativa da permissão scripting

A permissão scripting é necessária para inserir o texto de um prompt na caixa de mensagem da aba ativa do ChatGPT quando o usuário seleciona a ação de inserção. Também permite carregar o script de interface incluído no pacote caso o painel ainda não esteja disponível na aba. A execução é limitada aos domínios autorizados do ChatGPT. A extensão não envia a mensagem automaticamente nem extrai o histórico das conversas.

### Justificativa da permissão de host

O acesso a https://chatgpt.com/* e https://chat.openai.com/* é necessário para exibir o botão e o painel do PromptOS dentro do ChatGPT, ajustar o espaço da página quando o painel está aberto e localizar a caixa de mensagem para inserir o prompt solicitado pelo usuário. O segundo endereço mantém a compatibilidade com o domínio anterior do ChatGPT. A extensão não solicita acesso aos demais sites, não coleta histórico de navegação e não extrai conversas do ChatGPT.

### Código remoto

Selecionar: **Não, não uso código remoto.**

Se houver campo de explicação: Todo o JavaScript executado pelo PromptOS está incluído no pacote da extensão, incluindo a interface, o script de conteúdo e o service worker. A extensão não baixa nem executa scripts externos. A integração com o ChatGPT usa scripts locais incluídos no pacote.

### Uso de dados

Para o código analisado, não marcar categorias de coleta de dados transmitidos ao desenvolvedor ou a terceiros. A biblioteca, as imagens e os contadores de uso são processados e armazenados localmente; não há servidor, telemetria ou analytics na extensão. O acesso ao campo de mensagem serve para inserir o texto solicitado pelo usuário, não para coletar conversas.

Marcar as três certificações, caso a redação exibida corresponda a:

- Não vender nem transferir dados de usuários a terceiros fora dos casos aprovados.
- Não usar nem transferir dados para finalidades não relacionadas ao único propósito da extensão.
- Não usar nem transferir dados para determinar capacidade de crédito ou para concessão de empréstimos.

O usuário pode incluir dados pessoais nos próprios prompts. Por isso, a política não deve afirmar que nenhum dado é processado: deve explicar o armazenamento local e a inserção voluntária no ChatGPT. Quando o usuário envia a mensagem no ChatGPT, o tratamento pelo serviço segue as políticas desse serviço.

### URL da política de privacidade

Política publicada: https://promptos-ten.vercel.app/privacy.html

Site oficial: https://promptos-ten.vercel.app/

Suporte: https://github.com/evandromqs/promptos/issues

## Detalhes do app

### Nome

PromptOS

### Descrição curta

Organize prompts, preencha templates e reutilize sequências de trabalho diretamente no ChatGPT.

### Descrição detalhada

Mantenha seus prompts organizados e prontos para reutilizar no ChatGPT.

O PromptOS adiciona um painel à página do ChatGPT para você acessar sua biblioteca, preencher templates e preparar textos sem alternar entre várias ferramentas.

• Crie, edite e organize prompts por categoria.
• Encontre seus textos com busca e favoritos.
• Use variáveis como {tema} e {publico} para adaptar templates.
• Monte sequências de prompts e avance pelas etapas manualmente.
• Copie o texto preparado ou insira-o na caixa de mensagem do ChatGPT.
• Adicione imagens de referência à sua biblioteca.
• Exporte e importe backups em JSON.
• Escolha tema claro ou escuro e interface em português, inglês ou espanhol.

A biblioteca e as preferências ficam armazenadas localmente no navegador. O PromptOS não exige cadastro próprio e não utiliza telemetria. A inserção de texto depende de uma ação do usuário; o envio da mensagem continua sob seu controle no ChatGPT.

Compatível com chatgpt.com e chat.openai.com. O uso do ChatGPT depende do acesso do usuário ao próprio serviço.

PromptOS é uma extensão independente, sem afiliação ou endosso da OpenAI.

### Categoria e idioma

- Categoria sugerida: Produtividade; selecionar a opção correspondente disponível no painel.
- Idioma principal: Português (Brasil).
- Idiomas da interface: português, inglês e espanhol.
- Site e suporte: usar endereços públicos efetivamente verificados. Não há e-mail de suporte confirmado nesta análise.

## Instruções de teste

O PromptOS não exige conta própria, chave de API ou credenciais de teste. Para testar a integração, acessar o ChatGPT com uma conta do próprio serviço quando solicitado.

1. Instalar a extensão e abrir https://chatgpt.com/.
2. Abrir o painel pelo botão flutuante ou pelo ícone da extensão.
3. Criar um prompt com o título “Teste de publicação” e o conteúdo “Escreva três ideias sobre {tema}”. Salvar.
4. Localizar o prompt na biblioteca, abri-lo e preencher “tema” com “organização pessoal”.
5. Copiar o texto e verificar o preenchimento da variável.
6. Selecionar a ação de inserir no ChatGPT e verificar que o texto aparece no campo de mensagem sem envio automático.
7. Criar uma sequência usando prompts da biblioteca e avançar manualmente entre suas etapas.
8. Nas configurações, testar idioma, tema e exportação de backup JSON. Importar o backup e confirmar a restauração.
9. Reabrir o painel e verificar a persistência da biblioteca.

## Materiais disponíveis e conferências finais

- Ícone: store-assets/icon-128.png.
- Capturas: store-assets/screenshot-1-biblioteca.png até screenshot-5-privacidade-temas.png.
- Imagem promocional pequena: store-assets/promo-small-440x280.png.
- Imagem promocional de destaque: store-assets/promo-marquee-1400x560.png.
- O manifesto do código-fonte declara versão 0.5.0, storage, scripting e somente os dois hosts do ChatGPT. Conferir o manifesto do ZIP carregado antes de usar estas justificativas.
- Conferir visualmente se as capturas representam a versão enviada.
- Rever a política pública: mencionar imagens e contadores locais, inserção voluntária no ChatGPT, remoção dos dados, contato acessível e conformidade com os requisitos de Uso Limitado. Evitar afirmações absolutas de ausência de compartilhamento que ocultem o envio voluntário pelo usuário no ChatGPT.
- Definir visibilidade e países de distribuição conforme a preferência do publicador; esses dados não são dedutíveis do código.

## Referência

Orientações oficiais para estes campos: https://developer.chrome.com/docs/webstore/cws-dashboard-privacy
