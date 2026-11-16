---
name: "Força Aliada — home pública v2"
description: "Mundo próprio, produtos em uso: uma identidade clara e calorosa para jogar, criar e compartilhar."
colors:
  ink: "#182026"
  muted: "#52605e"
  paper: "#f7f8f5"
  white: "#fff"
  night: "#151b20"
  line: "#d9dfd9"
  green: "#43cd75"
  green-ink: "#176237"
  mint: "#e1f0e4"
  gold: "#f0c45b"
  action-ink: "#112b1c"
  action-hover: "#60dd8d"
  focus: "#318bd1"
  team-surface: "#ded0ff"
  team-ink: "#4f238f"
  discovery-blue: "#acd7f7"
  hero-accent: "#c2f2b8"
  scene-panel: "#11231cf7"
  skin-surface: "#f2e7c8"
  skin-ink: "#352d1c"
  skin-ocean: "#3875a5"
  skin-plum: "#805381"
  skin-explorer: "#537b44"
typography:
  display:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "clamp(58px,5.9vw,84px)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-.035em"
  headline:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "clamp(32px,3.4vw,48px)"
    fontWeight: 800
    lineHeight: 1.07
    letterSpacing: "-.035em"
  title:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "32px"
    fontWeight: 800
    lineHeight: 1.07
    letterSpacing: "-.035em"
  body:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  lead:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 800
    lineHeight: 1.6
  navigation:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 650
    lineHeight: 1.6
  link:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 750
    lineHeight: 1.6
rounded:
  tag: "4px"
  badge: "5px"
  interest: "6px"
  compact: "7px"
  control: "8px"
  field: "10px"
  preview: "12px"
  surface: "16px"
spacing:
  tight: "8px"
  control: "12px"
  small: "16px"
  medium: "24px"
  large: "32px"
  gutter: "48px"
  section: "72px"
components:
  button-primary:
    backgroundColor: "{colors.green}"
    textColor: "{colors.action-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "13px 23px"
  button-primary-hover:
    backgroundColor: "{colors.action-hover}"
  button-hero:
    backgroundColor: "{colors.green}"
    textColor: "{colors.action-ink}"
    rounded: "{rounded.control}"
    padding: "16px 24px"
  text-link:
    typography: "{typography.link}"
  search-field:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.field}"
    padding: "7px 7px 7px 15px"
  navigation:
    backgroundColor: "{colors.night}"
    typography: "{typography.navigation}"
  badge-team:
    backgroundColor: "{colors.team-surface}"
    textColor: "{colors.team-ink}"
    rounded: "{rounded.badge}"
    padding: "4px 10px"
  plan-card:
    backgroundColor: "#f5f6f0"
    textColor: "#182c20"
    rounded: "{rounded.surface}"
    padding: "26px"
  scene-control:
    backgroundColor: "#172b23cc"
    textColor: "{colors.white}"
    rounded: "{rounded.compact}"
    padding: "10px 12px"
  scene-story:
    backgroundColor: "{colors.scene-panel}"
    rounded: "{rounded.preview}"
    padding: "18px 20px 12px"
  skin-feature:
    backgroundColor: "{colors.skin-surface}"
    textColor: "{colors.skin-ink}"
    rounded: "{rounded.surface}"
    padding: "30px 28px 28px 12px"
  skin-swatch:
    textColor: "{colors.white}"
    width: "38px"
    height: "38px"
  routine-step:
    backgroundColor: "transparent"
    textColor: "#274632"
    rounded: "{rounded.control}"
    padding: "14px 17px"
  routine-step-selected:
    backgroundColor: "{colors.white}"
---

# Design System: Força Aliada — home pública v2

## Overview

**Creative North Star: "Mundo próprio, produtos em uso"**

Uma identidade jovem, clara e calorosa, construída com matéria visual própria, tipografia firme e controles que convidam ao uso. Grandes recortes do mundo e demonstrações reconhecíveis aproximam software e pessoas. A geometria em blocos mantém a origem da marca; a leitura da plataforma permanece à frente do cenário.

O papel claro dá espaço à leitura; o grafite organiza navegação e áreas de maior concentração. Verde, azul e dourado distinguem ações e contextos. A densidade é baixa nos títulos e maior nos controles e demonstrações. Movimento lento dá presença à cena; a pessoa pode pausá-lo e explorar os exemplos sem depender de animação.

**Key Characteristics:**
- Manrope de forte presença nos títulos e leitura direta nos controles.
- Cidades próprias em blocos, imagens do produto e demonstrações identificadas.
- Ação verde, descoberta azul e convivência dourada sobre papel e grafite.
- Retângulos suaves, controles compactos e sombras localizadas.
- Demonstrações pausáveis, foco visível e alternativas estáticas.

Registro atualizado por integração com a identidade existente em 16/11/2026. A paleta, Manrope, controles básicos e conta compartilhada foram preservados; a composição manual anterior permanece no histórico Git. Fontes: `index.html`, `home.css`, `cinema.css`, `platform-home.css`, `home.js`, `src/hero.js`, `src/world.js` e `src/skin.js`. `PRODUCT.md` fixa os compromissos de marca; `BRIEF.md` e `REVISAO.md` guardam a estratégia desta superfície. O seed herdado não foi corroborado: `BRIEF.md` registra **SEED UNKNOWN**, sem alegação de validação do sorteio.

## Colors

A paleta mantém papel levemente verde e grafite, com acentos funcionais. Os valores normativos estão no frontmatter; as rampas do sidecar são derivações de visualização, não novas cores de interface.

### Primary
- **Verde de ação:** `green`, `action-ink` e `action-hover` orientam os botões principais.
- **Menta:** `mint` sustenta a área do Manager; `green-ink` é o cursor dos campos.
- **Verde de luz:** `hero-accent` destaca a segunda linha do título sobre a cena.

### Secondary
- **Azul de descoberta:** `discovery-blue` identifica o acesso Minecraft na faixa de produtos.
- **Dourado de comunidade:** `gold` acompanha benefícios; os contextos de Community e skins usam variações quentes locais. `skin-surface` e `skin-ink` compõem o módulo do personagem.
- **Visuais de exemplo:** `skin-ocean`, `skin-plum` e `skin-explorer` identificam roupas selecionáveis, não categorias da marca.

### Tertiary
- **Violeta Team:** `team-surface` e `team-ink` identificam o plano. O componente de conta conserva seus próprios materiais de assinatura.

### Neutral
- **Tinta e texto secundário:** `ink` e `muted` mantêm a leitura nas superfícies claras.
- **Papel, branco e linha suave:** `paper`, `white` e `line` organizam página, controles e separadores.
- **Grafite e painel de cena:** `night` organiza navegação e assinatura; `scene-panel` dá contraste ao pequeno demonstrador sobre o mundo.
- **Azul de foco:** `focus` contorna os controles da home. A conta compartilhada mantém seu próprio foco.

**The Cor com função Rule.** Verde orienta a ação; azul e dourado identificam contextos; violeta identifica Team. A cor acompanha um rótulo ou estado explícito e nunca é a única informação.

## Typography

**Display Font:** Manrope variável local, com fallback `system-ui, sans-serif`.

**Body Font:** a mesma Manrope. Não há segunda família editorial nem fonte mono na home. A conta compartilhada conserva sua pilha interna.

**Character:** títulos pesados e compactos, parágrafos leves e abertos. Escala, peso e espaço estabelecem a hierarquia.

### Hierarchy
- **Display:** papel `display` na abertura, com peso 800. Entre 901 e 1100 px usa 68 px; até 900 px usa `clamp(42px,8.4vw,64px)`; até 380 px usa 42 px. O limite efetivo em telas amplas é 84 px, aplicado pela última folha de estilos.
- **Headline:** papel `headline` para seções. Manager usa `clamp(34px,3.5vw,49px)`; descoberta e Manager usam 35 px até 760 px. Assinatura e FAQ mantêm seus ajustes locais.
- **Title:** papel `title` nos módulos. Skins usa 34 px com entrelinha 1.12, reduzindo para 29, 27 e 25 px conforme o espaço; Community parte de 32 px e chega a 29 px.
- **Body:** papel `body` na leitura principal. Descoberta usa entrelinha 1.7; Manager e social, 1.75. O `lead` da abertura tem largura máxima de 430 px e cai para 15 px até 900 px, depois 14 px até 380 px.
- **Label:** `label`, `navigation` e `link` mantêm a família comum. A chamada da abertura usa 15 px, reduzidos a 13 px até 900 px.
- **Notas:** 11–12 px para metadados, demonstração e condições. Não substituem a explicação principal.
- **Preços:** números tabulares e peso 800; Pro usa 52 px, reduzidos a 48 px no celular; Team usa 27 px.

**The Uma família, várias escalas Rule.** A mesma Manrope sustenta títulos e controles; o peso 800 e o espaçamento negativo distinguem os títulos, enquanto os parágrafos mantêm ritmo aberto.

## Layout

O conteúdo usa contêiner de até 1328 px, com margens laterais de 48 px, reduzidas a 32 px até 1200 px e 18 px até 640 px. O cabeçalho preso ao topo tem contêiner de até 1536 px e altura mínima de 78 px, depois 70 px até 980 px e 66 px até 640 px. O menu da conta conserva seus próprios pontos de adaptação.

A cena atravessa a largura da janela. A altura parte de `calc(100svh - 112px)`, limitada entre 730 e 1050 px; até 1100 px o mínimo é 720 px; até 900 px a altura fixa é 850 px. Texto e ações ficam à esquerda, com demonstração no canto inferior direito. Até 900 px, mensagem, ações, cidade e demonstração seguem uma leitura vertical. A imagem móvel tem enquadramento próprio. Os controles de vista só aparecem ao explorar; não disputam a primeira leitura com a ação principal.

A implementação atual apresenta descoberta e skin em duas colunas iguais, social atravessando ambas, Manager em proporção .8:1.3 e assinatura em duas colunas. Até 1100 px a skin empilha personagem e texto; até 760 px, a página de produtos passa a uma coluna e a skin volta a duas partes compactas lado a lado. A faixa de produtos empilha até 900 px; assinatura e FAQ passam a uma coluna até 640 px. Estas relações descrevem a home, não um grid obrigatório para toda a marca.

Intervalos recorrentes de 8, 12, 16, 24, 32 e 48 px convivem com respiros maiores por seção. Descoberta usa 84/64 px verticais; Manager, 72/48 px; no celular, 48/38 e 44/34 px, respectivamente. O rodapé preserva duas colunas de links no celular. Quebras editoriais nunca devem unir palavras quando removidas.

## Elevation & Depth

A base permanece plana, com profundidade pelo cenário iluminado, contraste e sobreposição. A sombra separa a pequena demonstração do mundo, destaca o aplicativo e marca camadas temporárias. Luz, sombra e neblina pertencem à cena em blocos; não são decoração aplicada a todos os controles.

### Shadow Vocabulary
- **Demonstração sobre a cena:** `0 16px 44px #09130e40`.
- **Imagem do Manager:** `0 20px 38px #19382326`.
- **Ação em aproximação:** `0 7px 18px #1028171c`.
- **Rotina selecionada:** `0 7px 20px #214a2810`.
- **Imagem ampliada:** `0 24px 80px #0005`, sobre fundo escurecido.

**The Profundidade localizada Rule.** O fundo e os módulos de conteúdo permanecem planos; a sombra evidencia uma demonstração sobreposta, o aplicativo, um controle selecionado ou uma camada temporária.

## Shapes

Superfícies principais usam `surface`, controles usam `control`, a busca usa `field` e a demonstração usa `preview`. Selos e pequenas etiquetas usam raios menores. O círculo é reservado a avatar, escolha de visual e giro do personagem. Balões têm um canto menor para sugerir o lado da conversa. A geometria do mundo e do personagem é deliberadamente em blocos; isso não impõe cantos retos aos controles.

Ícones de contorno são SVG, normalmente de 21 px, traço 1.8 e pontas arredondadas. Variantes menores acompanham controles e metadados. O logotipo e a conta reutilizam os ativos existentes.

## Components

### Buttons

Diretos e compactos, com texto firme e seta de continuidade.

- **Primário:** `button-primary`, altura mínima de 50 px e intervalo de 22 px. Hover sobe 2 px, clareia e recebe sombra; clique retorna e reduz a escala para .98.
- **Abertura:** `button-hero`, altura mínima de 54 px. Até 900 px, altura mínima de 48 px e preenchimento de 13 × 19 px. A alternativa é um link branco sem caixa.
- **Link de texto:** `text-link`, altura mínima de 40 px e intervalo de 14 px. Hover sublinha e desloca a seta 4 px; a seta do botão se desloca 3 px.
- **Foco:** contorno de 3 px com afastamento de 4 px. Estados indisponíveis usam opacidade .5 e cursor próprio. O movimento de hover é removido com redução de movimento.

### Inputs / Fields

Busca branca, borda discreta e botão verde escuro, com ícone na entrada. O campo usa 13 px, reduzidos a 12 px até 760 px; o botão mantém pelo menos 44 × 44 px. O foco é do conjunto, com anel `0 0 0 2px #477ba1`. O envio e os links de estilos encaminham ao catálogo existente. Não há estados de erro de formulário a generalizar.

### Navigation

Faixa grafite com marca, produtos e conta. Links desktop revelam linha verde de 2 px em hover. Até 980 px a navegação abre verticalmente com descrição e ícone; Escape, clique externo, saída do foco e seleção de um destino a fecham. A faixa abaixo da cena dá acessos completos a Minecraft, Manager e Community, com cor e rótulo.

A conta é `FAAccountMenu`, compartilhada com o Manager. Reutilizar o componente, sua geometria, foco, avatar e materiais de assinatura. Não derivar uma segunda conta dos tokens da home. A barra de persona e campanha é ferramenta desta prévia.

### Chips

Selos Pro e Team identificam assinatura; não significam verificação de servidor. Links de interesse são controles compactos sobre fundo neutro, com 40 px de altura mínima e raio de 6 px. Na skin, a escolha circular mantém `aria-pressed`, marca de confirmação e contorno, sem depender só da cor.

### Cards / Containers

O personagem ocupa uma superfície quente e o Manager um campo menta. A demonstração sobre a cena usa superfície escura quase opaca. O cartão Pro usa `plan-card` sobre grafite; Team permanece em superfície escura própria. O seletor de período muda preço, nota de cobrança e destino juntos. As notas permanecem próximas da decisão.

### Cena própria e demonstração de produtos

A abertura usa geometria extraída em leitura de uma cópia do mundo próprio: dois recortes de cidades, interpretados por superfícies em blocos. É uma aproximação deliberada de formas, não reprodução integral dos modelos do Minecraft. As imagens de espera são renderizações da mesma geometria; não há raster de IA. Procedência e limites estão em `HERO-3D.md`.

Título, proposta e ação permanecem estáveis; campanhas mudam por escolha da prévia ou configuração. O pequeno demonstrador alterna servidores, skins e amigos a cada 7 s, com progresso de 6.4 s, entrada de 350 ms e curva `power3.out`. Hover ou foco nessa área pausa sua sequência; o botão geral pausa sequência e passeio. A cena faz um percurso lento de ida e volta em 26 s, sem trocar de vista automaticamente. Explorar recolhe texto e demonstração, revela quatro vistas e permite retornar com Escape. É uma escolha explícita da pessoa.

O poster aparece primeiro. WebGL, dados de geometria ou descompressão indisponíveis preservam a imagem e os destinos de produto. A segunda cidade é carregada sob demanda. O passeio para fora da tela e com aba oculta; a demonstração também pausa nesses estados. Redução de movimento inicia o conjunto pausado, elimina as transições CSS e torna seleções diretas imediatas; o controle de reprodução continua explícito. O render limita-se a cerca de 30 quadros/s e reduz a resolução quando necessário. O sidecar exemplifica controles e estados visuais, não emula a cena 3D.

### Skin interativa

O personagem não gira sozinho. Três looks são compostos a partir das camadas `SAMPLE_PARTS` existentes do editor e identificados como demonstração. Trocar roupa atualiza o personagem; girar avança 90 graus em 650 ms com `power3.out`, imediatamente sob redução de movimento. A inicialização é próxima à entrada na tela. Sem WebGL, a imagem permanece e os botões ainda trocam o visual; o giro fica oculto até o modelo estar pronto. A ação final abre o editor existente.

### Publicação e conversa

A composição combina avatar de exemplo, imagem do mundo próprio, legenda, sinais de reação e dois balões. A publicação e as mensagens são ilustrativas, mesmo quando a imagem tem origem real. A indicação de exemplo é visível. Não são dados de atividade de usuários, nem botões sociais funcionais dentro da home.

### Manager, FAQ e imagem ampliada

A interface do Manager é uma imagem demonstrativa ampliável. Três rotinas mudam seleção, ícone e explicação com anúncio discreto; a entrada dura 440 ms quando movimento é permitido. FAQ usa `details` nativo e divisórias, com chevron que gira. A imagem ampliada usa diálogo modal, fechamento explícito e retorno do foco à origem. A janela real do aplicativo não é simulada por controles sem função na home.

## Do's and Don'ts

### Do:
- **Do** usar matéria visual própria e identificar dados e conversas demonstrativos.
- **Do** preservar Manrope, verde de ação e os contextos de cor junto a rótulos claros.
- **Do** reutilizar o componente compartilhado de conta sem redesenhá-lo.
- **Do** manter texto e destinos úteis antes do carregamento do 3D.
- **Do** oferecer pausa, foco visível e compreensão sem movimento.
- **Do** preservar espaços entre palavras quando uma quebra editorial desaparece.

### Don't:
- **Don't** trocar automaticamente o título ou a oferta comercial junto à demonstração.
- **Don't** apresentar a geometria simplificada como reprodução integral do jogo ou as mensagens como atividade real.
- **Don't** acrescentar prefixos ornamentais aos títulos ou substituir SVG por glifos de texto.
- **Don't** espalhar sombras sobre os módulos que o sistema apresenta como planos.
- **Don't** tratar selo de assinatura e identificação de servidor como o mesmo sinal.
- **Don't** transformar notas compactas em padrão para o texto principal.

Não canonizado: `home.css` ainda contém o panorama manual e estilos sem uso nesta composição, incluindo a variável `--violet`; sua existência não os torna padrões da versão atual. A barra de prévia não é navegação pública. O seed herdado permanece desconhecido. Este passe registra a implementação e não repara esses resíduos nem valida intenção com testes de interface.
