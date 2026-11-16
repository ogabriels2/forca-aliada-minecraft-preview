# Home: produtos em primeiro plano

16 de novembro de 2026. Proposta em avaliação, isolada da home pública. A versão anterior permanece no histórico Git. O código ativo está em `index.html`, `home-3.css`, `home.js`, `src/home-experience.js` e `src/skin.js`.

## Decisão de produto

A home apresenta a Força Aliada como software e plataforma para jogar e criar comunidades. Manager, Minecraft e Community aparecem juntos na abertura, com explicação literal do que fazem. Criar conta é a ação principal; planos e acesso direto aos produtos continuam disponíveis. Usuários frequentes não precisam percorrer a apresentação.

O Manager abre a demonstração e recebe a primeira seção comercial. Isso dá visibilidade ao produto pago sem sugerir que todo o catálogo depende de assinatura. A assinatura reúne os benefícios e apresenta valores, capacidade e cobrança juntos. O mundo próprio aparece como exemplo de uso e origem das imagens, não como oferta principal nem como prova de escala comercial.

Alternativas consideradas:

| Opção | Vantagem | Limitação nesta fase | Decisão |
|---|---|---|---|
| Mundo 3D em tela cheia | Imersão e identidade própria | Foi confundido com um servidor ou projeto de construção; custo visual e técnico alto | Retirado da abertura, preservado no histórico |
| Página inteiramente centrada no Manager | Conversão comercial direta | Oculta catálogo, social e criação gratuita | Manager em destaque, sem substituir a empresa |
| Catálogo como home deslogada | Entrada rápida no uso | Pouco inventário real nesta fase e pouco contexto da empresa | Acesso direto; destino padrão depois de entrar |
| Institucional com três cards iguais | Fácil de organizar | Frio, repetitivo, não demonstra valor | Substituído por demonstrações e composições distintas |
| Apresentação conectada dos produtos | Explica oferta, uso e assinatura | Exige hierarquia para não virar lista de recursos | Direção implementada |

Essa é uma hipótese fundamentada de produto e design, não uma promessa de conversão. Depois da aprovação, validação com pessoas novas deve medir compreensão da oferta, primeira escolha e conclusão de cadastro.

## Referências examinadas, uma a uma

| Fonte | Material examinado | O que aproveitamos | O que não importamos |
|---|---|---|---|
| [21st](https://21st.dev/@manuarora700/components/container-scroll-animation) | Container Scroll Animation: prévia com perspectiva, rolagem e controles | Profundidade localizada para mostrar a interface real do aplicativo | Cena longa dependente de scroll; a imagem da demo estava indisponível. Nenhum prompt/HTML desse exemplo foi incorporado |
| [Profitize](https://profitize.com.br/build/landing-pages/nubo) | Nubo: prévia visual, pacote de prompt/CLAUDE/checklist, condições de acesso; ferramenta Raio-X | Contraste de escala, superfícies claras e acento forte; ritmo diferente entre seções | Pacote pago, metáfora de agência e 3D decorativo. Não houve compra |
| [Skiper](https://skiper-ui.com/v1/skiper52) | Expand on Hover, preview, código/uso e licença gratuita com atribuição | Feedback rápido e continuidade ao mudar seleção | Galeria estreita que esconde as opções; hover como condição para entender um produto. Código não distribuído |
| [Cult UI](https://www.cult-ui.com/docs/components/direction-aware-tabs) | Direction Aware Tabs, exemplo interativo e fonte completa | Direção da transição conforme a posição da aba | Blur, deslocamento de 300 px, bloqueio de cliques durante animação e dependência React/Motion |
| [Uberdesigner](https://uberdesigner.ai/t/portale) | Portale gratuito, preview e termos exibidos | Composição com profundidade e contraste quente/frio | Licença gratuita limitada a uso pessoal; prompt e projeto não foram reutilizados comercialmente |
| [React Bits](https://reactbits.dev/components/stack) | Stack, controles, opções de autoplay/hover e interface de código | Comparação entre interação direta e carrossel automático | Pilha de cartões oculta conteúdo importante; nenhuma dependência adicional instalada |
| [OriginKit](https://www.originkit.dev/functional) | Catálogo funcional, Charcoal Shuttle, alteração de seleção, editor e opções CLI/Code/AI Prompt | Estado selecionado contínuo e configuração de movimento | AI Prompt exigia nova chave; nenhuma foi criada. Tentativa de Copy Code não retornou texto utilizável, portanto não se registra como código obtido |
| [Motion](https://motion.dev/docs/animate) | Documentação de animate, sequências, interrupção e tamanho das versões | Critérios para escolher o motor e controlar animações | Segundo motor concorrente com GSAP |
| [GSAP](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/) | Timeline, matchMedia e reversão de movimentos | Motor já presente; pausa, interrupção e redução de movimento | Plugins de scroll desnecessários à tarefa |
| [Lenis](https://lenis.dev/) | Finalidade e exemplos de rolagem sincronizada | Critério para avaliar quando suavização ajuda | Não há cena ligada ao scroll que justifique trocar a rolagem nativa |
| [Anime.js](https://animejs.com/documentation/timeline/) | Timeline e coordenação de animações | Comparação da organização temporal | Segundo motor sem ganho funcional |
| [Mobbin](https://mobbin.com/discover/sites/latest) | Acervo por fluxos/seções; preview Graphical | Descrição concreta do produto, reconhecimento dos controles e acesso direto | Confundir estética de referência com evidência de conversão; acervo pago não foi adquirido |
| [Awwwards](https://www.awwwards.com/) | Busca gaming: contraste entre experiências imersivas, galerias e sites de estúdio | Escala e variação de composição | Premiação como substituto de usabilidade; luz neon e partículas sem função |
| [Cosmos](https://www.cosmos.so/) | Busca playful technology branding | Neutros como base e acentos distribuídos; contraste entre material e superfície | Mascotes, fotografias ou marcas de terceiros; resultados com estética de IA |
| [Pinterest](https://br.pinterest.com/search/pins/?q=gaming%20platform%20web%20design) | Busca de plataformas de jogos | Comparação de padrões recorrentes e seus excessos | Loja de jogos genérica com neon, grids e hero de personagem sem relação com a oferta |
| [Name That UI](https://namethatui.com/) | Dicionário e categorias de elementos/estilos | Nomes concretos dos componentes e linguagem de interação | Não foi copiado prompt; a interação de busca foi interrompida |
| [Manager](https://forcaaliada.com/manager) | Página completa e recursos existentes | Manrope, conta aprovada, verde de ação, interface real e alternância entre claro/escuro | Nenhum novo menu de conta nem linguagem de hospedagem em nuvem |

Não é necessário utilizar código de todas as bibliotecas. A seleção evita licenças incompatíveis, dependências duplicadas e efeitos que enfraquecem a compreensão.

## Código realmente obtido

A fonte completa do Direction Aware Tabs foi lida na documentação do Cult e guardada em `research-cult-direction-aware-tabs.tsx`, a partir do repositório oficial `nolly-studio/cult-ui`, arquivo `apps/www/registry/default/ui/direction-aware-tabs.tsx`. Licença MIT preservada em `media/Cult-UI-LICENSE.txt`.

A home adapta o princípio direcional em JavaScript e GSAP. A distância cai para 24 px, a entrada dura 320 ms e a saída 200 ms; não bloqueia a próxima seleção. ARIA, teclado, painéis inativos e interrupção foram implementados para esta página. O TSX de referência não é executado nem faz parte do bundle.

## Vídeo fornecido

O vídeo foi examinado visualmente em quadros e transcrito localmente. Seu tema é principalmente a entrada/carregamento: evitar imagens e fontes rearranjando a tela, contadores artificiais e espera desnecessária; usar uma entrada que pertença à identidade. Aplicação: fonte local pré-carregada, dimensões reservadas, conteúdo visível por padrão e uma entrada breve. Não adicionamos uma tela de loading para simular sofisticação.

## Direção visual

Base grafite `#202428` e papel neutro `#f7f8fa`. Verde `#37d17a` indica a ação principal. Azul `#3262d9` acompanha o software e seleção. Âmbar aparece no editor e no Pro; violeta acompanha conversa e Team, sempre com rótulo e contraste. Não há um filtro verde sobre imagens, títulos em degradê ou uma cor forte preenchendo todos os módulos.

Manrope é mantida por continuidade com a página aprovada do Manager. A abertura usa tipografia firme e demonstração à direita; Manager tem faixa grafite e simulador; descoberta combina imagem e busca; skins e conversa têm superfícies e comportamentos próprios; assinatura é uma decisão comercial clara. Fotos, skins e interfaces pertencem ao material já existente da Força Aliada.

## Coreografia

| Elemento | Papel | Início | Duração | Movimento | Relação |
|---|---|---|---|---|---|
| Título, explicação e ações | Principal | 0 ms | 550 ms | 14 px e opacidade | Uma unidade de leitura |
| Demonstrador | Apoio | 80 ms | 700 ms | 24 px e opacidade | Sobrepõe a entrada do título |
| Aba anterior | Apoio | Clique | 200 ms | 24 px na direção de saída | Sai enquanto a próxima entra |
| Nova aba | Principal | Mesmo clique | 320 ms | 24 px na direção da escolha | Espaço reservado; sem deslocar a página |
| Confirmação do backup | Apoio | Fim do progresso | 250 ms | Confirmação e mudança de texto | Explica o resultado da rotina |
| Etapa do Manager | Principal | Avançar/voltar | 250 ms | 12 px na direção da ação | Resposta imediata e reversível |
| Giro da skin | Principal | Clique | 650 ms | 90 graus | Render somente durante a ação |

Não se movem: cabeçalho, preços em repouso, texto comercial da abertura, busca e seções inteiras ao rolar. São referências estáveis. O backup pode ser pausado e para fora da tela/aba oculta. Redução de movimento elimina os deslocamentos e a repetição, preservando conteúdo e seleção.

## Leis e heurísticas do guia, contextualizadas

| Princípio | Aplicação / limite |
|---|---|
| Hick | Uma ação principal na abertura; três produtos identificados, detalhes progressivos |
| Fitts e distância | Áreas de clique adequadas, ação junto ao contexto; controles do simulador permanecem no mesmo lugar |
| Jakob | Links, tabs, busca, menu e FAQ convencionais; conta idêntica ao componente aprovado |
| Proximidade | Preço, período, limite e contratação juntos; descrição junto da demonstração correspondente |
| Miller | Agrupamento por tarefa; não usamos um número mágico de itens como regra universal |
| Doherty | Seleção responde de imediato, sem aguardar o término da animação anterior |
| Von Restorff | Verde reservado à ação; selo dourado/violeta destaca plano, não tudo ao mesmo tempo |
| Posição serial | Oferta e entrada no início; cadastro novamente após benefícios e dúvidas |
| Pico-fim | Experimentação da skin e do Manager, fechamento direto; sem afirmar efeito garantido de conversão |
| Zeigarnik | Progresso 1 de 3 somente na demonstração, sem impor cadastro ou criar pendências artificiais |
| Occam | Retirada do passeio 3D e de bibliotecas de animação redundantes |
| Tesler | A interface esconde complexidade operacional sem omitir que o servidor depende do PC ligado |
| Postel | Busca aceita texto livre e remove espaços; controles não dependem de precisão gestual |
| Murphy | Imagem alternativa sem WebGL, cliques rápidos, teclado, menu estreito e falhas de carregamento considerados |
| Semelhança | Mesmo desenho para ações equivalentes; diferenciação de produtos pelo conteúdo |
| Conectividade uniforme | Abas ligadas ao mesmo palco; conta e benefícios tratados como partes da mesma plataforma |
| Parkinson | Nenhum contador de urgência falso; demonstração curta e opcional |
| Carga cognitiva | Funções concretas antes de recursos detalhados; sem falso feed de usuários ativos |
| Gradiente de meta | Três etapas visíveis no exemplo; fim explícito, sem recompensa comercial inventada |

Essas heurísticas orientam decisões; não substituem testes com usuários nem são todas leis experimentais universais.

## Checklist do guia

1. **Pixels:** nenhum rastreador de marketing foi adicionado à prévia. Implantação futura deve respeitar consentimento e necessidade, não apenas adiar até um clique.
2. **Imagens:** WebP próprio; 3D da skin carregado perto da seção. Imagens abaixo da abertura usam lazy loading.
3. **Estabilidade:** dimensões reservadas; altura estável entre produtos; sem loading artificial.
4. **Metadados:** título e descrição específicos. Prévia `noindex,nofollow`; canonical da produção só na promoção da página aprovada.
5. **Open Graph:** imagem real do Manager, texto e tipo definidos.
6. **Schema:** não publicar dados estruturados de oferta/empresa duplicados na prévia. Integrar os dados verdadeiros do domínio principal após aprovação; não inventar avaliações nem organização nova.
7. **Responsividade:** composição vertical própria; navegação recolhida; teste de 320 a 1920 px.
8. **Integridade:** conversas, interface e fluxo demonstrativos identificados. Proveniência mantida nos documentos, sem rótulos de ferramenta expostos no produto.
9. **PageSpeed:** registrar resultado real, limitações e correções em `VALIDACAO-3.md`; não atribuir nota sem medição.
10. **Guia:** critérios acima cruzados com briefing, código e renderização. A aprovação de direção continua sendo do proprietário.
