---
name: "Força Aliada — home pública v2"
description: "Panorama com perspectivas: criar, jogar e compartilhar em uma identidade clara e calorosa."
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
  sky: "#e1edf7"
  action-ink: "#112b1c"
  action-hover: "#60dd8d"
  light-button: "#f9faf5"
  light-ink: "#17231c"
  light-hover: "#e3f4e7"
  focus: "#318bd1"
  community-surface: "#f3e1ad"
  community-ink: "#513a0a"
  team-surface: "#ded0ff"
  team-ink: "#4f238f"
typography:
  display:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "clamp(44px,5.9vw,84px)"
    fontWeight: 800
    lineHeight: 1.04
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
  compact: "7px"
  control: "8px"
  preview: "12px"
  surface: "16px"
spacing:
  tight: "8px"
  control: "12px"
  small: "16px"
  medium: "24px"
  large: "32px"
  gutter: "48px"
  section: "80px"
components:
  button-primary:
    backgroundColor: "{colors.green}"
    textColor: "{colors.action-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "13px 23px"
  button-primary-hover:
    backgroundColor: "{colors.action-hover}"
  button-light:
    backgroundColor: "{colors.light-button}"
    textColor: "{colors.light-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "13px 23px"
  button-light-hover:
    backgroundColor: "{colors.light-hover}"
  text-link:
    typography: "{typography.link}"
  search-field:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "4px 5px 4px 13px"
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
  product-tab:
    backgroundColor: "#202925"
    textColor: "#dfe8e1"
    padding: "19px 28px"
  product-tab-manager-selected:
    backgroundColor: "{colors.mint}"
    textColor: "#173723"
  routine-step:
    backgroundColor: "transparent"
    textColor: "#274632"
    rounded: "{rounded.control}"
    padding: "13px 10px"
  routine-step-selected:
    backgroundColor: "{colors.white}"
---

# Design System: Força Aliada — home pública v2

## Overview

**Creative North Star: "Panorama com perspectivas"**

Uma identidade jovem, clara e calorosa, construída com imagens próprias, tipografia firme e controles que convidam ao uso. O mundo real da comunidade aproxima software e pessoas: fotografias amplas convivem com recortes reconhecíveis dos produtos, sem transformar a marca em uma apresentação corporativa.

O papel claro dá espaço à leitura; o grafite organiza navegação e áreas de maior concentração. Verde, azul e dourado distinguem ações e contextos. A densidade é baixa nos títulos e maior nos controles e demonstrações. O movimento responde à escolha da pessoa e preserva a compreensão quando reduzido.

**Key Characteristics:**
- Manrope de forte presença nos títulos e leitura direta nos controles.
- Imagens próprias com recortes horizontais e interfaces demonstrativas identificadas.
- Ação verde, descoberta azul e convivência dourada sobre bases claras e grafite.
- Superfícies arredondadas, controles compactos e sombras reservadas a sobreposições.
- Interação manual, foco visível e adaptação real ao espaço disponível.

Escopo: sistema extraído de `index.html`, `home.css`, `home.js` e do componente compartilhado de conta desta pasta. `BRIEF.md` registra a direção escolhida; `PRODUCT.md` fornece os compromissos de marca. Este documento descreve a prévia concluída, sem substituir a identidade do catálogo ou a implementação compartilhada de conta. A revisão final em `.impeccable/review/finish-review.md` tem disposição `ship` para a correção pontual avaliada.

## Colors

A paleta combina papel levemente verde e grafite, com acentos funcionais que aproximam criação, descoberta e comunidade. Os valores normativos estão no frontmatter.

### Primary
- **Verde de ação (`green`):** chamadas principais e marca de seleção do Manager. O texto escuro de ação usa `action-ink`; o estado de aproximação usa `action-hover`.
- **Verde de leitura (`green-ink`):** cursor de edição. Os títulos e links verdes têm variações locais observadas; não formam uma escala tonal publicada pelo código.
- **Menta (`mint`):** contexto de criação e fundo da perspectiva selecionada do Manager.

### Secondary
- **Azul de descoberta (`sky`):** módulo do catálogo e perspectiva selecionada de Minecraft.
- **Dourado de comunidade (`gold`):** seleção de Community e ícones de benefícios. `community-surface` e `community-ink` compõem o acesso à comunidade.

### Tertiary
- **Violeta Team (`team-surface`, `team-ink`):** identificação funcional do plano Team, sem competir com a ação verde. O componente de conta mantém seus próprios materiais de assinatura.

### Neutral
- **Tinta (`ink`) e texto secundário (`muted`):** leitura sobre superfícies claras.
- **Papel (`paper`) e branco (`white`):** página e controles internos, respectivamente.
- **Grafite (`night`):** cabeçalho, rodapé, área de assinatura e base do panorama.
- **Linha suave (`line`):** separadores de FAQ, ferramentas e encerramento.
- **Botão claro (`light-button`, `light-ink`, `light-hover`):** ação contextual sobre imagens e superfícies escuras.
- **Azul de foco (`focus`):** contorno dos controles da home. A conta compartilhada conserva seu foco verde próprio.

**The Cor com função Rule.** Verde orienta a ação; azul e dourado identificam contextos; violeta identifica Team. A cor acompanha um rótulo ou estado explícito e nunca é a única informação.

As rampas do sidecar são derivações para visualização da paleta, não novos valores aplicados à interface.

## Typography

**Display Font:** Manrope variável local, com fallback `system-ui, sans-serif`.

**Body Font:** a mesma Manrope. Não há uma segunda família editorial nem uma fonte mono no sistema da home. A conta compartilhada conserva também `Inter` em seu fallback interno.

**Character:** títulos pesados, próximos e compactos; parágrafos mais leves e abertos. A hierarquia usa diferenças de escala e peso, sem prefixos ornamentais acima dos títulos.

### Hierarchy
- **Display:** papel `display`, reservado ao título de abertura. Em até 980 px passa a 64 px; em até 640 px usa `clamp(38px,10.4vw,62px)` e espaçamento de letras de `-.04em`.
- **Headline:** papel `headline`, base dos títulos de seção. Existem ajustes contextuais, como 44 px na história e 40 px na FAQ em telas amplas.
- **Title:** papel `title`, base dos títulos de módulos; variações locais entre 27 e 31 px se acomodam à composição.
- **Body:** papel `body`; textos de módulos usam 13–15 px e entrelinha de 1.6–1.75 conforme a largura. A abertura usa `lead`, com limite de 46 caracteres tipográficos (`46ch`), reduzido a 43 no celular.
- **Label:** papel `label` para a chamada principal. A navegação usa o papel `navigation`; links de texto têm 14 px e peso 750, com variantes menores por contexto.
- **Notas:** 11–12 px para condições, metadados e indicações de demonstração. São texto auxiliar, sem substituir a explicação principal.
- **Preços:** números tabulares, peso 800; valor Pro de 52 px, reduzido a 48 px no celular, e Team de 27 px.

**The Uma família, várias escalas Rule.** A mesma Manrope sustenta títulos e controles; o peso 800 e o espaçamento negativo distinguem os títulos, enquanto os parágrafos mantêm ritmo aberto.

## Layout

O contêiner principal tem largura máxima de 1328 px. As margens laterais são 48 px na base, 32 px até 1200 px e 18 px até 640 px. O cabeçalho usa contêiner próprio de até 1536 px; sua altura mínima é 78 px, depois 70 px até 980 px e 66 px até 640 px. Ele permanece preso ao topo.

A composição alterna campos largos com grupos assimétricos: abertura em proporção 1.25:1, descoberta em 1.55:1 e assinatura em duas colunas. São relações observadas por seção, não um grid obrigatório para novas páginas. O ritmo reutiliza intervalos de 8, 12, 16, 24, 32 e 48 px, com seções amplas próximas de 80 px. Ajustes locais existem e não implicam uma escala matemática rígida.

Até 1200 px, os intervalos e módulos se compactam. Até 980 px, a navegação vira menu, o título da abertura ocupa uma faixa própria e a proposta ainda pode dividir espaço com as ações. Até 640 px, a ordem fica linear: título, proposta, ações, seletor e demonstração; descoberta, assinatura, FAQ e encerramento passam a uma coluna. O rodapé mantém duas colunas de links. O componente de conta tem adaptação própria em 600 px; a regra de 420 px vinculada ao cabeçalho do Manager não é uma regra geral desta home.

O panorama mede 424 px de altura na base, 462 px a partir de 1600 px, 390 px até 1200 px, 365 px até 980 px e 550 px no celular. A altura maior no celular acomoda texto e demonstração empilhados. As três opções de produto continuam visíveis; seus subtítulos são ocultados no menor formato. Quebras de linha editoriais que desaparecem no celular preservam espaços entre palavras.

## Elevation & Depth

A base é plana, com profundidade por contraste de superfície, fotografia e sobreposição. Sombras suaves sustentam as prévias de produto, o menu de conta, a imagem ampliada e os avisos. Pequenas rotações nas prévias e no selo do mundo acrescentam informalidade sem alterar a geometria dos controles.

### Shadow Vocabulary
- **Prévia sobre o panorama:** `0 20px 52px #07160f2e`, compartilhada pela janela do Manager, cartão de servidor e publicação.
- **Ação em aproximação:** `0 7px 18px #1028171c`, apenas na chamada verde em hover.
- **Rotina selecionada:** `0 7px 20px #214a2810`, reforço discreto sobre menta.
- **Conta compartilhada:** `0 16px 48px #09131930`, aplicado pelo componente existente.
- **Imagem ampliada:** `0 24px 80px #0005`, com fundo escurecido do diálogo.
- **Aviso temporário:** `0 8px 28px #0002`.

**The Profundidade localizada Rule.** O fundo e os módulos de conteúdo permanecem planos; a sombra evidencia uma prévia sobreposta, um controle selecionado ou uma camada temporária.

## Shapes

Superfícies principais usam o raio `surface`; controles usam `control`; prévias e diálogo usam `preview`. Etiquetas e selos têm raios menores (`tag`, `badge`, `compact`). São retângulos suavizados, sem converter toda a interface em pílulas. A janela do Manager tem cantos superiores de 10 px e base reta, coerente com o recorte de aplicativo.

O panorama e as fotos recortam a mídia dentro da própria forma. Na base desktop, o cartão de servidor gira 1,5 grau, a publicação gira −1 grau e o selo do mundo gira 3 graus. As linhas divisórias são finas e contidas; não há moldura espessa universal.

Ícones de contorno são SVG, normalmente de 21 px, com traço 1.8 e pontas arredondadas. Variantes menores acompanham controles e metadados. O logotipo é o ativo de marca existente. A conta compartilhada mantém sua geometria e seus materiais próprios.

## Components

### Buttons

Diretos e compactos, com texto firme e seta que indica continuidade.

- **Primário:** `button-primary`; altura mínima de 50 px, espaço de 22 px entre texto e ícone. Em hover sobe 2 px, clareia e recebe sombra; em clique retorna e reduz a escala para .98.
- **Claro:** `button-light`, a mesma forma sobre imagens e grafite, com superfície clara no lugar do verde.
- **Link de texto:** sem caixa, 14 px, peso 750, altura mínima de 40 px e intervalo de 14 px. Em hover ganha sublinhado e desloca a seta 4 px; a seta dos botões se desloca 3 px.
- **Foco:** contorno de 3 px com afastamento de 4 px. Controles indisponíveis ficam com opacidade .5 e cursor de indisponibilidade.

### Inputs / Fields

Busca integrada a uma superfície branca, com ícone de entrada e botão azul no final. O campo usa 13 px; o botão mede 40 × 40 px. O foco pertence ao conjunto, com anel `0 0 0 2px #477ba1`, evitando dois contornos sobrepostos. Não existem estilos de erro ou validação de formulário a generalizar nesta prévia.

### Navigation

Faixa grafite com marca, navegação e conta. Os links usam o papel `navigation` e revelam uma linha verde de 2 px em hover. Até 980 px o botão abre a navegação vertical com rótulo, descrição e ícone por produto. Escape, clique externo e deslocamento de foco para fora fecham o menu; os links também o fecham.

A conta é `FAAccountMenu`, compartilhada com o Manager. Reutilizar o componente e seus arquivos de origem; não construir um segundo menu a partir dos tokens desta página. Seu dropdown, foco, avatar e selo de assinatura pertencem ao contrato compartilhado.

### Chips

Etiquetas identificam plataformas e planos; não são adornos de abertura. As etiquetas de mundo têm fundo neutro e raio `tag`. Pro usa um gradiente dourado; Team usa `badge-team`. O significado de plano não se confunde com o selo de servidor oficial.

### Cards / Containers

Módulos de criação, descoberta e comunidade usam superfícies menta, azul e dourada, respectivamente, com cantos `surface` e sem sombra em repouso. O cartão de plano usa `plan-card`; o controle de período mostra a seleção em superfície clara sobre grafite. Os valores e os links de contratação mudam juntos ao selecionar o período.

### Panorama de produtos

Três botões sem rolagem automática escolhem perspectivas da mesma imagem. O estado ativo combina fundo, faixa inferior de 4 px, rótulo e `aria-selected`; no celular a faixa mede 3 px. Setas, Home e End navegam entre as opções; apenas a opção ativa integra a sequência de Tab. O painel exibe título, contexto, ação e uma prévia real ou demonstrativa identificada.

A transição do conteúdo dura 440 ms com a curva `cubic-bezier(.16,1,.3,1)`; o segundo elemento entra 45 ms depois. O enquadramento do mundo muda em 1,2 s. Controles comuns transitam em 180–300 ms. Com redução de movimento, transições e animações são desligadas, o enquadramento fica sem escala animada e os cartões de prévia ficam sem rotação.

### Rotina interativa

Linhas de rotina compartilham raio `control` e fundo transparente. A seleção fica branca, com ícone de confirmação, sombra leve e `aria-pressed`; a explicação atualizada é anunciada de forma discreta. O texto permanece utilizável sem animação.

### FAQ, imagem e retorno de ação

A FAQ usa divisórias e o elemento nativo `details`, sem cartões adicionais; o chevron gira com a abertura. A imagem ampliada usa diálogo modal com botão de fechamento e devolve o foco à origem. Copiar o endereço produz um aviso temporário com anúncio acessível, durante 4,5 s.

## Do's and Don'ts

### Do:
- **Do** usar imagens próprias e identificar recortes com conteúdo demonstrativo.
- **Do** preservar as funções de verde, azul, dourado e violeta junto a rótulos claros.
- **Do** manter Manrope, títulos firmes e controles com texto legível.
- **Do** reutilizar o componente compartilhado de conta sem redesenhá-lo.
- **Do** preservar foco visível, operação por teclado e compreensão sem movimento.
- **Do** manter espaços entre palavras quando uma quebra editorial deixa de aparecer no celular.

### Don't:
- **Don't** transformar o panorama manual em carrossel automático.
- **Don't** acrescentar prefixos ornamentais acima dos títulos ou substituir SVG por glifos de texto.
- **Don't** espalhar sombras sobre os módulos que o sistema apresenta como planos.
- **Don't** tratar o selo de assinatura e a identificação de servidor oficial como o mesmo sinal.
- **Don't** transformar as notas compactas em padrão para o texto principal.

Não canonizado: a variável `--violet` está declarada, mas não é consumida pelo CSS da home; o violeta Team documentado vem dos valores realmente aplicados. A barra de prévia é ferramenta de demonstração, não padrão de navegação pública. Nenhum defeito foi reparado nesta documentação; a separação de palavras no celular já consta como resolvida na revisão final.
