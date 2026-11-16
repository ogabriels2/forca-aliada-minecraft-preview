# Pesquisa e decisões — 16/11/2026

Leitura do brief anexado, PRODUCT/BRIEF/ESTRATEGIA/DESIGN/VALIDACAO/README e implementação da v2. Pesquisa das páginas públicas atuais via web e inspeção no Edge de Manager, catálogo, Community, assinatura, fundação, servidor próprio e Roblox. A ferramenta de busca devolveu uma versão antiga de /minecraft; o navegador confirmou o catálogo atual. A avaliação é de padrões, não prova estatística de conversão.

## Referências de produto

| Página consultada | Princípio útil e razão | O que não transportar |
|---|---|---|
| [Stripe](https://stripe.com/) | Uma oferta ampla ganha unidade por uma promessa e interfaces concretas. Mostrar o trabalho que cada produto resolve. | Escala, clientes, métricas e linguagem financeira não são evidência da Força Aliada. |
| [Linear](https://linear.app/) | Interface com atividade legível demonstra um processo, não apenas uma imagem de software. | Microtexto escuro e discurso de produtividade empresarial. |
| [Vercel](https://vercel.com/) | Entrada evidente e áreas de produto separadas por tarefa diminuem a procura. | Linguagem de infraestrutura e menus para grandes empresas. |
| [Apple](https://www.apple.com/macbook-pro/) | Produto grande, espaço controlado e narrativa de capacidades em sequência. | Peso de filmes e conclusões de superioridade sem testes. |
| [Notion](https://www.notion.com/pricing) | Período, unidade de cobrança e limites visíveis permitem comparar sem surpresas. | Tabela enorme, preço por pessoa ou recomendação arbitrária de plano. |
| [Figma](https://www.figma.com/pricing/) | Plano e tipo de uso explicitados antes da lista de funcionalidades. | Complexidade de assentos/licenças que não existe na nossa oferta. |
| [Discord](https://discord.com/) | Contexto de pessoas jogando e conversando explica a utilidade social. | Promessas de voz, vídeo e grupos que não foram confirmadas aqui. |
| [Roblox](https://www.roblox.com/) | Home deslogada liga promessa, criar conta e exemplos de jogos de imediato. Inspecionada no Edge. | Milhões de jogos, avaliações e volume de catálogo; não temos essa escala. |
| [Medal](https://medal.tv/) | Verbo concreto → demonstração → ação. Mostra o compartilhamento acontecendo. | Números de usuários e promessas de desempenho copiadas. |
| [Modrinth](https://modrinth.com/) | Conteúdo identificável, categorias reconhecíveis e acesso direto a descobrir. | Taxonomia gigantesca e fingir abundância antes de existir acervo. |
| [Apex](https://apexminecrafthosting.com/) | Explicação de criação e oferta verificável perto da decisão de compra. | Venda de RAM/hospedagem e descontos de primeiro mês. Manager usa o PC do cliente. |
| [Shockbyte](https://shockbyte.com/) | Mostrar o painel ajuda a avaliar o serviço antes de contratar. | Logos, avaliações, garantias 24/7 e hospedagem em datacenter. |
| [BisectHosting](https://www.bisecthosting.com/) | Suporte e guias têm destinos claros ao lado dos produtos. | Amplitude de catálogo ou infraestrutura de hospedagem. |
| [Minecraft Servers](https://minecraftservers.org/) | Tipo, edição e endereço ajudam a decidir onde jogar. | Rankings, jogadores e status estáticos inventados. |
| [Planet Minecraft](https://www.planetminecraft.com/servers/) | Criações, skins e servidores dão contexto visual à comunidade. | Densidade de navegação de um portal maduro na home de entrada. |

## Fontes da oferta

[Manager](https://forcaaliada.com/manager), [assinatura](https://forcaaliada.com/assinatura), [catálogo](https://forcaaliada.com/minecraft), [Community](https://forcaaliada.com/community), [empresa](https://forcaaliada.com/fundacao), [servidor próprio](https://forcaaliada.com/minecraft/forca-aliada), [home atual](https://forcaaliada.com/).

Confirmados na página pública: Pro R$29,90/mês ou R$299/ano, até 2 servidores e 3 pessoas; Team R$79,90/mês ou R$799/ano, até 5 servidores e 10 pessoas. Aplicativo Windows no PC do cliente, console remoto, endereço protegido, backups e benefícios Community. O instalador não é hospedagem. Valores de referência, contratação confirma condições. Catálogo/skins/Community e página básica têm entrada gratuita. Não reproduzir números de atividade de contas reais na prévia.

## Caderno de decisões

1. **Título explica a oferta; cidade dá identidade.** Não apresentar o servidor próprio como negócio principal. [NN/g: home](https://www.nngroup.com/articles/homepage-design-principles/) recomenda comunicar propósito, mostrar exemplos e orientar ação. [Baymard: amplitude](https://baymard.com/research-articles/inferring-product-catalog-from-homepage) sustenta apresentar as categorias reais, sem poluição visual.
2. **Criar conta é principal; planos são secundários.** O uso gratuito deve estar separado de Manager pago; a busca continua acessível sem cadastro. Adaptação do padrão Roblox/Modrinth à oferta pequena real.
3. **Imagem real, leve, em vez de WebGL obrigatório.** Atende a cena ampla pedida neste brief e deixa orçamento para a interface nítida. [Web Vitals](https://web.dev/articles/vitals): LCP/CLS/INP medem aspectos diferentes; Lighthouse não comprova INP em campo.
4. **Uma fonte, não duas.** Manrope já é a voz aprovada. Escala, peso e composições diferentes oferecem contraste sem adicionar outra família e custo de carregamento.
5. **Processo sticky somente onde há espaço.** O scroll é nativo; a demo permite controle manual. Redução de movimento e telas estreitas usam sequência empilhada. Não esconder conteúdo esperando animação.
6. **FAQ com details e lightbox dialog.** [Disclosure APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) e [Dialog APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) orientam estado, teclado, foco e retorno ao acionador.
7. **Abas só na demo de três etapas.** [Tabs APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) orienta setas/Home/End, seleção e painel associado. Período de cobrança usa botões pressionados; não são três painéis diferentes.
8. **Movimento nativo e progressivo.** [MDN scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations) informa o aprimoramento por suporte. [View Transitions](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) estudado, mas não necessário: pequenas transições WAAPI locais preservam foco e evitam duplicação visual de texto. Sem biblioteca extra.
9. **Adaptação pelo espaço útil.** [Container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_size_and_style_queries) permitem ajustar os controles da demo sem depender só do viewport; fallback flex/grid permanece.
10. **Cor indica função.** Verde ação, azul descoberta, dourado conversa/benefícios, violeta só o selo Team já aprovado. Não colorir blocos inteiros por produto, nem usar gênero como código.
11. **Acessibilidade é parte do produto.** [WCAG 2.2](https://www.w3.org/TR/WCAG22/): foco, contraste, operação por teclado e reflow. Alvos de 44px são meta desta proposta (mais exigente que o mínimo AA de 24px com exceções). Auditoria automática não é certificação integral.
12. **Prévia sem simular autenticação real.** Menu compartilhado em modo visitante; uma conta de exemplo só quando escolhida no controle de revisão. Login mantém /minecraft como destino padrão; quem veio de um produto deve conservar esse destino na integração final.

Limite da pesquisa: páginas comerciais mostram soluções, não demonstram eficácia causal. Baymard consultado na parte pública; artigo inicialmente tentado em /blog/homepage-category-navigation indisponível, substituído pelas páginas públicas de pesquisa. Sem cópia de HTML, imagens ou marca de concorrentes.
